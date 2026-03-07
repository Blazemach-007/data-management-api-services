require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // LAN accessible

app.use(cors());
app.use(express.json());

// Serve generated invoices as static files
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

// ─── HEALTH CHECK ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'CareAll backend is running.' });
});

// ─── ROUTES ────────────────────────────────────────────────────
app.use('/api/auth',         require('./src/routes/authRoutes'));
app.use('/api/customers',    require('./src/routes/customerRoutes'));
app.use('/api/employees',    require('./src/routes/employeeRoutes'));
app.use('/api/fastag',       require('./src/routes/fastagRoutes'));
app.use('/api/pancard',      require('./src/routes/pancardRoutes'));
app.use('/api/dsc',          require('./src/routes/dscRoutes'));
app.use('/api/insurance',    require('./src/routes/insuranceRoutes'));
app.use('/api/aadhaar',      require('./src/routes/aadhaarRoutes'));
app.use('/api/other',        require('./src/routes/otherRoutes'));
app.use('/api/transactions', require('./src/routes/transactionRoutes'));
app.use('/api/invoices',     require('./src/routes/invoiceRoutes'));
app.use('/api/reports',      require('./src/routes/reportRoutes'));
app.use('/api/inventory',    require('./src/routes/inventoryRoutes'));
app.use('/api/followups',    require('./src/routes/followupRoutes'));

// ─── START ─────────────────────────────────────────────────────
app.listen(PORT, HOST, async () => {
    console.log(`\n🚀 CareAll backend running on http://localhost:${PORT}`);
    console.log(`   LAN access: http://<your-ip>:${PORT}\n`);
    await connectDB();
    require('./src/scheduler');
});
