require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const customerRoutes = require('./src/routes/customerRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = 5000; // Use 5000 to match your frontend request

// Middleware
app.use(cors()); 
app.use(express.json());

// --- ROUTES ---

// 1. Health/Test Route (The one you asked for)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: "success", 
        message: "Backend is connected to PostgreSQL and running!" 
    });
});

app.use('/api/customers', customerRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);

// Start Server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
    await connectDB(); // This triggers the DB connection and table creation
});