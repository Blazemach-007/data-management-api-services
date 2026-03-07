const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { Transaction, Customer, ServiceFastag, ServicePancard, ServiceDSC, ServiceInsurance, ServiceAadhaar, ServiceOther, sequelize } = require('../config/db');
const { Op, fn, col, literal } = require('sequelize');

// GET /api/reports/summary  — overall system stats
router.get('/summary', verifyToken, async (req, res) => {
    try {
        const [totalCustomers, totalTransactions, revenueResult] = await Promise.all([
            Customer.count(),
            Transaction.count(),
            Transaction.findOne({
                attributes: [[fn('SUM', col('amount')), 'total']],
                where: { payment_status: 'Paid' }
            })
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRevenue = await Transaction.findOne({
            attributes: [[fn('SUM', col('amount')), 'total']],
            where: { payment_status: 'Paid', createdAt: { [Op.gte]: today } }
        });

        const todayCount = await Transaction.count({
            where: { createdAt: { [Op.gte]: today } }
        });

        res.json({
            totalCustomers,
            totalTransactions,
            totalRevenue: parseFloat(revenueResult?.dataValues?.total || 0),
            todayRevenue: parseFloat(todayRevenue?.dataValues?.total || 0),
            todayCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reports/monthly?year=2025&month=3
router.get('/monthly', verifyToken, async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const transactions = await Transaction.findAll({
            attributes: [
                'service_type',
                [fn('SUM', col('amount')), 'revenue'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                createdAt: { [Op.between]: [startDate, endDate] },
                payment_status: 'Paid'
            },
            group: ['service_type']
        });

        res.json(transactions.map(t => ({
            service_type: t.service_type,
            revenue: parseFloat(t.dataValues.revenue || 0),
            count: parseInt(t.dataValues.count || 0)
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reports/daily?days=30
router.get('/daily', verifyToken, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const transactions = await Transaction.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('SUM', col('amount')), 'revenue'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                createdAt: { [Op.gte]: startDate },
                payment_status: 'Paid'
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        res.json(transactions.map(t => ({
            date: t.dataValues.date,
            revenue: parseFloat(t.dataValues.revenue || 0),
            count: parseInt(t.dataValues.count || 0)
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
