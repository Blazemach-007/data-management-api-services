const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
    Customer, Transaction,
    ServiceFastag, ServicePancard, ServiceDSC,
    ServiceInsurance, ServiceAadhaar, ServiceOther
} = require('../config/db');

router.use(verifyToken);

// GET /api/customers — list all, with optional search
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const where = search ? {
            [Op.or]: [
                { full_name: { [Op.iLike]: `%${search}%` } },
                { phone_number: { [Op.iLike]: `%${search}%` } }
            ]
        } : {};
        const customers = await Customer.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json(customers);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/customers/:id — customer detail with full service history
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const [fastag, pancard, dsc, insurance, aadhaar, other, transactions] = await Promise.all([
            ServiceFastag.findAll({ where: { CustomerId: req.params.id } }),
            ServicePancard.findAll({ where: { CustomerId: req.params.id } }),
            ServiceDSC.findAll({ where: { CustomerId: req.params.id } }),
            ServiceInsurance.findAll({ where: { CustomerId: req.params.id } }),
            ServiceAadhaar.findAll({ where: { CustomerId: req.params.id } }),
            ServiceOther.findAll({ where: { CustomerId: req.params.id } }),
            Transaction.findAll({ where: { CustomerId: req.params.id }, order: [['createdAt', 'DESC']] })
        ]);

        res.json({
            customer,
            services: { fastag, pancard, dsc, insurance, aadhaar, other },
            transactions
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/customers — create new customer
router.post('/', async (req, res) => {
    try {
        const { full_name, phone_number, email, address, pincode } = req.body;
        const existing = await Customer.findOne({ where: { phone_number } });
        if (existing) return res.status(400).json({ message: 'Customer with this phone number already exists.' });
        const customer = await Customer.create({ full_name, phone_number, email, address, pincode });
        res.status(201).json(customer);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/customers/:id — update customer
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        await customer.update(req.body);
        res.json(customer);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/customers/:id — admin only
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const deleted = await Customer.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
