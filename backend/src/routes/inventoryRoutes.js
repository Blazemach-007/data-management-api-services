const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { Inventory, InventoryTransaction, Employee } = require('../config/db');

// GET /api/inventory
router.get('/', verifyToken, async (req, res) => {
    try {
        const items = await Inventory.findAll({ order: [['createdAt', 'DESC']] });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/inventory
router.post('/', verifyToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
        const item = await Inventory.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/inventory/:id
router.put('/:id', verifyToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
        const item = await Inventory.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        await item.update(req.body);
        res.json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/inventory/:id
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
    try {
        const item = await Inventory.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        await item.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/inventory/:id/transaction  — stock IN or OUT
router.post('/:id/transaction', verifyToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
        const item = await Inventory.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        const { type, quantity, reason } = req.body;
        if (!['IN', 'OUT'].includes(type)) return res.status(400).json({ error: 'type must be IN or OUT' });

        const qty = parseInt(quantity);
        if (type === 'OUT' && item.quantity < qty) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        const txn = await InventoryTransaction.create({
            InventoryId: item.id,
            EmployeeId: req.employee.id,
            type,
            quantity: qty,
            reason
        });

        const newQty = type === 'IN' ? item.quantity + qty : item.quantity - qty;
        await item.update({ quantity: newQty });

        res.status(201).json({ transaction: txn, newQuantity: newQty });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/inventory/:id/transactions
router.get('/:id/transactions', verifyToken, async (req, res) => {
    try {
        const txns = await InventoryTransaction.findAll({
            where: { InventoryId: req.params.id },
            include: [{ model: Employee, attributes: ['full_name'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(txns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
