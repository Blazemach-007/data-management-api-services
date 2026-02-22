const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); 
const { Employee } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Apply verifyToken to all routes
router.use(verifyToken);

// GET /api/employees - Any logged in user can list employees (for dropdowns etc)
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/employees - Only Admins can create new users
router.post('/', isAdmin, async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;

        // 1. Check if email exists (Changed from username)
        const exists = await Employee.findOne({ where: { email } });
        if (exists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Create Employee
        const newEmployee = await Employee.create({
            email,             // <--- Using email
            password_hash,
            full_name,
            role: role || 'staff'
        });

        // 4. Return success (Fixed variable in response)
        res.status(201).json({ 
            message: 'User created successfully', 
            user: { email, full_name, role } 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/employees/:id - Only Admins can delete users
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Employee.destroy({ where: { id } });

        if (!deleted) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;