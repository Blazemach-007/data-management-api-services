const express = require('express');
const router = express.Router();
const { ServiceFastag, Customer, Employee } = require('../config/db');
const { authenticate, isAdmin, isManagerOrAdmin } = require('../middleware/auth');

const include = [
    { model: Customer, attributes: ['id', 'full_name', 'phone_number'] },
    { model: Employee, attributes: ['id', 'full_name', 'role'] }
];

router.get('/', authenticate, async (req, res) => {
    try {
        const data = await ServiceFastag.findAll({ include, order: [['createdAt', 'DESC']] });
        res.json(data);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const row = await ServiceFastag.findByPk(req.params.id, { include });
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const row = await ServiceFastag.create({ ...req.body, EmployeeId: req.user.id });
        res.status(201).json(row);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authenticate, async (req, res) => {
    try {
        const row = await ServiceFastag.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        await row.update(req.body);
        res.json(row);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Verify (Manager+)
router.put('/:id/verify', authenticate, isManagerOrAdmin, async (req, res) => {
    try {
        const row = await ServiceFastag.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        await row.update({ verified: true, status: 'Completed' });
        res.json({ message: 'Verified', row });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const row = await ServiceFastag.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        await row.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
