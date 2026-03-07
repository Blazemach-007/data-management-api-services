const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { ServiceInsurance, Customer, Employee } = require('../config/db');
const { authenticate, isAdmin, isManagerOrAdmin } = require('../middleware/auth');

const include = [
    { model: Customer, attributes: ['id', 'full_name', 'phone_number'] },
    { model: Employee, attributes: ['id', 'full_name', 'role'] }
];

router.get('/', authenticate, async (req, res) => {
    try {
        const data = await ServiceInsurance.findAll({ include, order: [['createdAt', 'DESC']] });
        res.json(data);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/expiring', authenticate, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const today = new Date();
        const future = new Date(); future.setDate(today.getDate() + days);
        const data = await ServiceInsurance.findAll({
            where: { expiry_date: { [Op.between]: [today, future] }, status: { [Op.ne]: 'Expired' } },
            include, order: [['expiry_date', 'ASC']]
        });
        res.json(data);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const row = await ServiceInsurance.findByPk(req.params.id, { include });
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const row = await ServiceInsurance.create({ ...req.body, EmployeeId: req.user.id });
        res.status(201).json(row);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authenticate, async (req, res) => {
    try {
        const row = await ServiceInsurance.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        await row.update(req.body);
        res.json(row);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/verify', authenticate, isManagerOrAdmin, async (req, res) => {
    try {
        const row = await ServiceInsurance.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        await row.update({ verified: true, status: 'Active' });
        res.json({ message: 'Verified' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/followup', authenticate, async (req, res) => {
    try {
        const row = await ServiceInsurance.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        await row.update({ follow_up_status: req.body.follow_up_status, last_contact_date: new Date(), remarks: req.body.notes || row.remarks });
        res.json({ message: 'Follow-up updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const row = await ServiceInsurance.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        await row.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
