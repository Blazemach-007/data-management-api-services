const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import JWT
const { Employee } = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await Employee.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Check if active
        if (!user.is_active) {
            return res.status(403).json({ message: 'Account is disabled' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' } // Token lasts for 24 hours
        );

        // 4. Send success with role for routing and token
        res.json({
            message: 'Login successful',
            token: token, // SEND TOKEN TO FRONTEND
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role // 'admin' or 'staff'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
    try {
        const { email, old_password, new_password } = req.body;

        // 1. Find user
        const user = await Employee.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Verify old password
        const isMatch = await bcrypt.compare(old_password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password' });
        }

        // 3. Hash new password and save
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(new_password, salt);
        await user.save();

        res.json({ message: 'Password changed successfully. Please log in again.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;