const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// 1. SETUP CONNECTION
const sequelize = new Sequelize(
    process.env.DB_NAME || 'data-db', 
    process.env.DB_USER || 'postgres', 
    process.env.DB_PASS || 'root', 
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
        define: {
            timestamps: true,
            freezeTableName: true
        }
    }
);

// Helper Object for Reusable ID Definition
// We use this so we don't have to type the same ID code for every table
const uuidPrimaryKey = {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Automatically generates a unique UUID
    primaryKey: true,
    allowNull: false
};

// 2. DEFINE MODELS (SCHEMAS)

// --- Employee Table ---
const Employee = sequelize.define('Employee', {
    id: uuidPrimaryKey, // <--- UUID Added
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'staff' },
    full_name: { type: DataTypes.STRING, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// --- Customer Table ---
const Customer = sequelize.define('Customer', {
    id: uuidPrimaryKey, // <--- UUID Added
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone_number: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT },
    pincode: { type: DataTypes.STRING }
});

// --- Service 1: Fastag ---
const FastagService = sequelize.define('Service_Fastag', {
    id: uuidPrimaryKey, // <--- UUID Added
    vehicle_number: { type: DataTypes.STRING, allowNull: false },
    vehicle_type: { type: DataTypes.STRING },
    amount_paid: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'Completed' }
});

// --- Service 2: Insurance ---
const InsuranceService = sequelize.define('Service_Insurance', {
    id: uuidPrimaryKey, // <--- UUID Added
    policy_number: { type: DataTypes.STRING, unique: true },
    insurance_provider: { type: DataTypes.STRING },
    policy_type: { type: DataTypes.STRING },
    expiry_date: { type: DataTypes.DATE },
    amount_paid: { type: DataTypes.FLOAT, allowNull: false }
});

// --- Service 3: Aadhaar ---
const AadhaarService = sequelize.define('Service_Aadhaar', {
    id: uuidPrimaryKey, // <--- UUID Added
    aadhaar_number: { type: DataTypes.STRING },
    service_type: { type: DataTypes.STRING },
    amount_paid: { type: DataTypes.FLOAT, defaultValue: 0.0 }
});

// --- Service 4: Other ---
const OtherService = sequelize.define('Service_Other', {
    id: uuidPrimaryKey, // <--- UUID Added
    service_name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    amount_paid: { type: DataTypes.FLOAT, allowNull: false }
});

// 3. DEFINE RELATIONSHIPS
// By using UUIDs as Primary Keys above, Sequelize will automatically
// make the Foreign Keys (CustomerId, EmployeeId) UUIDs as well.

const services = [FastagService, InsuranceService, AadhaarService, OtherService];

services.forEach((Service) => {
    // 1. Link to Customer
    // This adds a 'CustomerId' column to the Service table
    Customer.hasMany(Service, { foreignKey: { allowNull: false } }); 
    Service.belongsTo(Customer, { foreignKey: { allowNull: false } });

    // 2. Link to Employee
    // This adds an 'EmployeeId' column to the Service table
    Employee.hasMany(Service, { foreignKey: { allowNull: false } });
    Service.belongsTo(Employee, { foreignKey: { allowNull: false } });
});

// 4. SYNC FUNCTION
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL Connected.');
        
        // "alter: true" is crucial here. It detects that you changed ID to UUID
        // and updates the table structure without deleting data.
        await sequelize.sync({ alter: true }); 
        console.log('✅ All Tables Synced with UUIDs & Timestamps.');

        // --- SEED DEFAULT ADMIN ---
        const adminCount = await Employee.count();
        if (adminCount === 0) {
            console.log('⚠️ No users found. Creating default Admin...');
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin1', salt);

            await Employee.create({
                email: 'admin1@test.com', // <--- Updated Email
                password_hash: hashedPassword,
                role: 'admin',
                full_name: 'System Administrator',
                is_active: true
            });
            console.log('✅ Default Admin created: Login: admin1@test.com / Pass: admin1');
        }

    } catch (error) {
        console.error('❌ Database Connection Error:', error);
    }
};

module.exports = { 
    sequelize, 
    connectDB, 
    Employee, 
    Customer, 
    FastagService, 
    InsuranceService, 
    AadhaarService, 
    OtherService 
};