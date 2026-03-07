const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { FollowUp, ServiceDSC, ServiceInsurance, Customer } = require('../config/db');
const { Op } = require('sequelize');

// GET /api/followups — all follow-ups with customer info
router.get('/', verifyToken, async (req, res) => {
    try {
        const followups = await FollowUp.findAll({
            include: [{ model: Customer, attributes: ['full_name', 'phone_number'] }],
            order: [['expiry_date', 'ASC']]
        });
        res.json(followups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/followups/expiring?days=90 — DSC + Insurance expiring soon
router.get('/expiring', verifyToken, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 90;
        const today = new Date();
        const future = new Date();
        future.setDate(future.getDate() + days);

        const [dscItems, insuranceItems] = await Promise.all([
            ServiceDSC.findAll({
                where: {
                    expiry_date: { [Op.between]: [today, future] },
                    status: { [Op.ne]: 'Renewed' }
                },
                include: [{ model: Customer, attributes: ['full_name', 'phone_number', 'email'] }],
                order: [['expiry_date', 'ASC']]
            }),
            ServiceInsurance.findAll({
                where: {
                    expiry_date: { [Op.between]: [today, future] },
                    status: { [Op.ne]: 'Renewed' }
                },
                include: [{ model: Customer, attributes: ['full_name', 'phone_number', 'email'] }],
                order: [['expiry_date', 'ASC']]
            })
        ]);

        // Also include already-expired items
        const [expiredDSC, expiredInsurance] = await Promise.all([
            ServiceDSC.findAll({
                where: {
                    expiry_date: { [Op.lt]: today },
                    status: { [Op.ne]: 'Renewed' }
                },
                include: [{ model: Customer, attributes: ['full_name', 'phone_number', 'email'] }],
                order: [['expiry_date', 'ASC']]
            }),
            ServiceInsurance.findAll({
                where: {
                    expiry_date: { [Op.lt]: today },
                    status: { [Op.ne]: 'Renewed' }
                },
                include: [{ model: Customer, attributes: ['full_name', 'phone_number', 'email'] }],
                order: [['expiry_date', 'ASC']]
            })
        ]);

        res.json({
            expired: {
                dsc: expiredDSC,
                insurance: expiredInsurance
            },
            expiring_soon: {
                dsc: dscItems,
                insurance: insuranceItems
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/followups/:type/:id  — update follow-up status on a service
router.put('/:type/:id', verifyToken, async (req, res) => {
    try {
        const { type, id } = req.params;
        const { follow_up_status, last_contact_date, remarks } = req.body;

        let service;
        if (type === 'dsc') {
            service = await ServiceDSC.findByPk(id);
        } else if (type === 'insurance') {
            service = await ServiceInsurance.findByPk(id);
        } else {
            return res.status(400).json({ error: 'type must be dsc or insurance' });
        }

        if (!service) return res.status(404).json({ error: 'Not found' });

        await service.update({
            follow_up_status: follow_up_status || service.follow_up_status,
            last_contact_date: last_contact_date || service.last_contact_date,
            remarks: remarks || service.remarks
        });

        res.json(service);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
