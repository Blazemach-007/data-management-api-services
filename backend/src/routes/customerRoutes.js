const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth'); // Import Middleware
const { Customer } = require('../config/db'); // Import the Customer model

// Apply verifyToken to all routes in this file
router.use(verifyToken);

// GET /api/customers - List all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.findAll({
            order: [['createdAt', 'DESC']] // Show newest first
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/customers - Create a new customer
router.post('/', async (req, res) => {
    try {
        const { full_name, phone_number, email, address, pincode } = req.body;

        // 1. Validation: Check if customer already exists (by Phone)
        const existingCustomer = await Customer.findOne({ where: { phone_number } });
        if (existingCustomer) {
            return res.status(400).json({ status: 'error', message: 'Customer with this phone number already exists.' });
        }

        // 2. Create the new customer
        const newCustomer = await Customer.create({
            full_name,
            phone_number,
            email,
            address,
            pincode
        });

        res.status(201).json({
            status: 'success',
            message: 'Customer created successfully!',
            data: newCustomer
        });

    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

module.exports = router;