const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

// 1. IMPORT ALL MODELS ONCE AT THE VERY TOP
const { 
    FastagService, 
    InsuranceService, 
    AadhaarService, 
    OtherService,
    Customer,
    Employee
} = require('../config/db');

// 2. DEFINE HELPER ONCE
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Apply verifyToken to all routes first
router.use(verifyToken);

// ==========================================
// GET ROUTE: FETCH ALL TRANSACTIONS
// ==========================================
// Only Admins should see all transactions
router.get('/', isAdmin, asyncHandler(async (req, res) => {
    
    // We want to pull the names along with the IDs
    const includeConfig = [
        { model: Customer, attributes: ['id', 'full_name', 'phone_number'] },
        { model: Employee, attributes: ['id', 'full_name', 'email'] }
    ];

    // Fetch from all 4 tables simultaneously
    const [fastags, insurances, aadhaars, others] = await Promise.all([
        FastagService.findAll({ include: includeConfig }),
        InsuranceService.findAll({ include: includeConfig }),
        AadhaarService.findAll({ include: includeConfig }),
        OtherService.findAll({ include: includeConfig })
    ]);

    // Format the data to add a "service_category" tag
    const formatData = (data, type) => data.map(item => ({
        ...item.toJSON(),
        service_category: type
    }));

    // Combine into one big array
    let allTransactions = [
        ...formatData(fastags, 'FASTAG'),
        ...formatData(insurances, 'INSURANCE'),
        ...formatData(aadhaars, 'AADHAAR'),
        ...formatData(others, 'OTHER')
    ];

    // Sort by newest first
    allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allTransactions);
}));

// ==========================================
// POST ROUTES: CREATE TRANSACTIONS
// ==========================================

// 1. FASTAG ENDPOINT
router.post('/fastag', asyncHandler(async (req, res) => {
    // We expect customer_id from the frontend. employee_id comes from the TOKEN.
    const { vehicle_number, vehicle_type, amount_paid, customer_id } = req.body;
    
    const newService = await FastagService.create({
        vehicle_number,
        vehicle_type,
        amount_paid,
        CustomerId: customer_id, // Sequelize matches these Foreign Keys automatically
        EmployeeId: req.user.id // SECURE: Use ID from JWT token
    });

    res.status(201).json({ message: 'Fastag transaction recorded', data: newService });
}));

// 2. INSURANCE ENDPOINT
router.post('/insurance', asyncHandler(async (req, res) => {
    const { policy_number, insurance_provider, policy_type, expiry_date, amount_paid, customer_id } = req.body;

    const newService = await InsuranceService.create({
        policy_number,
        insurance_provider,
        policy_type,
        expiry_date,
        amount_paid,
        CustomerId: customer_id,
        EmployeeId: req.user.id // SECURE: Use ID from JWT token
    });

    res.status(201).json({ message: 'Insurance transaction recorded', data: newService });
}));

// 3. AADHAAR ENDPOINT
router.post('/aadhaar', asyncHandler(async (req, res) => {
    const { aadhaar_number, service_type, amount_paid, customer_id } = req.body;

    const newService = await AadhaarService.create({
        aadhaar_number,
        service_type,
        amount_paid,
        CustomerId: customer_id,
        EmployeeId: req.user.id // SECURE: Use ID from JWT token
    });

    res.status(201).json({ message: 'Aadhaar transaction recorded', data: newService });
}));

// 4. OTHER SERVICES ENDPOINT
router.post('/other', asyncHandler(async (req, res) => {
    const { service_name, description, amount_paid, customer_id } = req.body;

    const newService = await OtherService.create({
        service_name,
        description,
        amount_paid,
        CustomerId: customer_id,
        EmployeeId: req.user.id // SECURE: Use ID from JWT token
    });

    res.status(201).json({ message: 'Service transaction recorded', data: newService });
}));

module.exports = router;