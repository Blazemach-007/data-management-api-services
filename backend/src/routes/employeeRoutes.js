const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Employee } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(employees);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/employees/:id
router.get('/:id', async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/employees — admin only
router.post('/', isAdmin, async (req, res) => {
    try {
        const { email, password, full_name, role, phone } = req.body;
        const exists = await Employee.findOne({ where: { email } });
        if (exists) return res.status(400).json({ message: 'Email already in use' });
        const password_hash = await bcrypt.hash(password, 10);
        const employee = await Employee.create({ email, password_hash, full_name, role: role || 'staff', phone });
        res.status(201).json({
            id: employee.id, email: employee.email,
            full_name: employee.full_name, role: employee.role
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/employees/:id — admin only
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        const { password, ...rest } = req.body;
        if (password) rest.password_hash = await bcrypt.hash(password, 10);
        await employee.update(rest);
        const { password_hash, ...safe } = employee.toJSON();
        res.json(safe);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/employees/:id — admin only
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const deleted = await Employee.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
