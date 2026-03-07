const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin, isManagerOrAdmin } = require('../middleware/auth');
const { Transaction, Customer, Employee } = require('../config/db');
const { Op } = require('sequelize');

const include = [
    { model: Customer, attributes: ['id', 'full_name', 'phone_number'] },
    { model: Employee, attributes: ['id', 'full_name', 'role'] }
];

// GET /api/transactions — all (manager/admin) or own (staff)
router.get('/', verifyToken, async (req, res) => {
    try {
        const where = req.user.role === 'staff' ? { EmployeeId: req.user.id } : {};
        const transactions = await Transaction.findAll({
            where,
            include,
            order: [['createdAt', 'DESC']]
        });
        res.json(transactions);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/transactions/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const txn = await Transaction.findByPk(req.params.id, { include });
        if (!txn) return res.status(404).json({ message: 'Transaction not found' });
        res.json(txn);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/transactions — create a transaction record
router.post('/', verifyToken, async (req, res) => {
    try {
        const { customer_id, service_type, service_id, amount, payment_method, payment_status, notes } = req.body;
        const txn = await Transaction.create({
            CustomerId: customer_id,
            EmployeeId: req.user.id,
            service_type,
            service_id,
            amount,
            payment_method: payment_method || 'Cash',
            payment_status: payment_status || 'Paid',
            notes
        });
        res.status(201).json(txn);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/transactions/:id — update payment status (manager/admin)
router.put('/:id', verifyToken, isManagerOrAdmin, async (req, res) => {
    try {
        const txn = await Transaction.findByPk(req.params.id);
        if (!txn) return res.status(404).json({ message: 'Transaction not found' });
        await txn.update(req.body);
        res.json(txn);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/transactions/:id — admin only
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const deleted = await Transaction.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'Transaction not found' });
        res.json({ message: 'Transaction deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
