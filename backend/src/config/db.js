require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// 1. CONNECTION — uses .env variables
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        define: {
            timestamps: true,
            freezeTableName: true
        }
    }
);

const uuidPK = {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
};

// ─── CORE TABLES ───────────────────────────────────────────────

const Employee = sequelize.define('Employee', {
    id: uuidPK,
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'manager', 'staff'), defaultValue: 'staff' },
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Customer = sequelize.define('Customer', {
    id: uuidPK,
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone_number: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT },
    pincode: { type: DataTypes.STRING }
});

// ─── SERVICE TABLES ────────────────────────────────────────────

const ServiceFastag = sequelize.define('Service_Fastag', {
    id: uuidPK,
    vehicle_number: { type: DataTypes.STRING, allowNull: false },
    vehicle_type: { type: DataTypes.STRING },
    bank: { type: DataTypes.STRING },
    tag_id: { type: DataTypes.STRING },
    chassis_no: { type: DataTypes.STRING },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'Completed', 'Rejected'), defaultValue: 'Completed' },
    notes: { type: DataTypes.TEXT }
});

const ServicePancard = sequelize.define('Service_Pancard', {
    id: uuidPK,
    pan_number: { type: DataTypes.STRING },
    applicant_name: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY },
    father_name: { type: DataTypes.STRING },
    form_type: { type: DataTypes.ENUM('49A', '49AA'), defaultValue: '49A' },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'Submitted', 'Completed', 'Rejected'), defaultValue: 'Pending' },
    notes: { type: DataTypes.TEXT }
});

const ServiceDSC = sequelize.define('Service_DSC', {
    id: uuidPK,
    cert_type: { type: DataTypes.STRING },
    serial_number: { type: DataTypes.STRING },
    issued_date: { type: DataTypes.DATEONLY },
    expiry_date: { type: DataTypes.DATEONLY },
    authority: { type: DataTypes.STRING },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('Active', 'Expired', 'Renewed'), defaultValue: 'Active' },
    follow_up_status: { type: DataTypes.ENUM('None', 'Pending', 'Contacted', 'Done'), defaultValue: 'None' },
    last_contact_date: { type: DataTypes.DATEONLY },
    notes: { type: DataTypes.TEXT }
});

const ServiceInsurance = sequelize.define('Service_Insurance', {
    id: uuidPK,
    policy_number: { type: DataTypes.STRING, unique: true },
    provider: { type: DataTypes.STRING },
    policy_type: { type: DataTypes.ENUM('Life', 'Vehicle', 'Health', 'Other'), defaultValue: 'Vehicle' },
    premium: { type: DataTypes.FLOAT },
    expiry_date: { type: DataTypes.DATEONLY },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('Active', 'Expired', 'Renewed', 'Cancelled'), defaultValue: 'Active' },
    follow_up_status: { type: DataTypes.ENUM('None', 'Pending', 'Contacted', 'Done'), defaultValue: 'None' },
    last_contact_date: { type: DataTypes.DATEONLY },
    notes: { type: DataTypes.TEXT }
});

const ServiceAadhaar = sequelize.define('Service_Aadhaar', {
    id: uuidPK,
    aadhaar_number: { type: DataTypes.STRING },
    update_type: { type: DataTypes.STRING },
    request_id: { type: DataTypes.STRING },
    amount: { type: DataTypes.FLOAT, defaultValue: 0.0 },
    status: { type: DataTypes.ENUM('Pending', 'Submitted', 'Completed', 'Rejected'), defaultValue: 'Pending' },
    notes: { type: DataTypes.TEXT }
});

const ServiceOther = sequelize.define('Service_Other', {
    id: uuidPK,
    service_name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'Completed'), defaultValue: 'Completed' },
    notes: { type: DataTypes.TEXT }
});

// ─── SUPPORTING TABLES ─────────────────────────────────────────

const Transaction = sequelize.define('Transaction', {
    id: uuidPK,
    service_type: {
        type: DataTypes.ENUM('Fastag', 'Pancard', 'DSC', 'Insurance', 'Aadhaar', 'Other'),
        allowNull: false
    },
    service_id: { type: DataTypes.UUID, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    payment_method: { type: DataTypes.ENUM('Cash', 'UPI', 'Card', 'NetBanking', 'Other'), defaultValue: 'Cash' },
    payment_status: { type: DataTypes.ENUM('Paid', 'Pending', 'Failed'), defaultValue: 'Paid' },
    notes: { type: DataTypes.TEXT }
});

const Invoice = sequelize.define('Invoice', {
    id: uuidPK,
    invoice_number: { type: DataTypes.STRING, unique: true },
    pdf_path: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('Generated', 'Sent', 'Cancelled'), defaultValue: 'Generated' }
});

const Inventory = sequelize.define('Inventory', {
    id: uuidPK,
    item_name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING },
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    unit: { type: DataTypes.STRING, defaultValue: 'pcs' },
    min_stock_alert: { type: DataTypes.INTEGER, defaultValue: 5 },
    notes: { type: DataTypes.TEXT }
});

const InventoryTransaction = sequelize.define('Inventory_Transaction', {
    id: uuidPK,
    type: { type: DataTypes.ENUM('in', 'out'), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.STRING }
});

const FollowUp = sequelize.define('FollowUp', {
    id: uuidPK,
    service_type: { type: DataTypes.ENUM('DSC', 'Insurance'), allowNull: false },
    service_id: { type: DataTypes.UUID, allowNull: false },
    expiry_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('Pending', 'Contacted', 'Done', 'Ignored'), defaultValue: 'Pending' },
    last_contact_date: { type: DataTypes.DATEONLY },
    notes: { type: DataTypes.TEXT }
});

const SmsLog = sequelize.define('SmsLog', {
    id: uuidPK,
    phone_number: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('Sent', 'Failed', 'Pending'), defaultValue: 'Pending' },
    provider_response: { type: DataTypes.TEXT }
});

// ─── RELATIONSHIPS ─────────────────────────────────────────────

const allServices = [ServiceFastag, ServicePancard, ServiceDSC, ServiceInsurance, ServiceAadhaar, ServiceOther];

allServices.forEach(Service => {
    Customer.hasMany(Service, { foreignKey: { allowNull: false } });
    Service.belongsTo(Customer, { foreignKey: { allowNull: false } });
    Employee.hasMany(Service, { foreignKey: { allowNull: false } });
    Service.belongsTo(Employee, { foreignKey: { allowNull: false } });
});

// Transactions
Customer.hasMany(Transaction, { foreignKey: { allowNull: false } });
Transaction.belongsTo(Customer, { foreignKey: { allowNull: false } });
Employee.hasMany(Transaction, { foreignKey: { allowNull: false } });
Transaction.belongsTo(Employee, { foreignKey: { allowNull: false } });

// Invoices
Transaction.hasOne(Invoice, { foreignKey: { allowNull: false } });
Invoice.belongsTo(Transaction, { foreignKey: { allowNull: false } });

// Inventory transactions
Inventory.hasMany(InventoryTransaction, { foreignKey: { allowNull: false } });
InventoryTransaction.belongsTo(Inventory, { foreignKey: { allowNull: false } });
Employee.hasMany(InventoryTransaction, { foreignKey: { allowNull: false } });
InventoryTransaction.belongsTo(Employee, { foreignKey: { allowNull: false } });

// Follow-ups
Customer.hasMany(FollowUp, { foreignKey: { allowNull: false } });
FollowUp.belongsTo(Customer, { foreignKey: { allowNull: false } });

// SMS Logs
Customer.hasMany(SmsLog, { foreignKey: { allowNull: true } });
SmsLog.belongsTo(Customer, { foreignKey: { allowNull: true } });

// ─── SYNC ───────────────────────────────────────────────────────

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connected.');
        await sequelize.sync({ alter: true });
        console.log('✅ All tables synced.');
    } catch (error) {
        console.error('❌ Database error:', error);
        process.exit(1);
    }
};

module.exports = {
    sequelize,
    connectDB,
    Employee,
    Customer,
    ServiceFastag,
    ServicePancard,
    ServiceDSC,
    ServiceInsurance,
    ServiceAadhaar,
    ServiceOther,
    Transaction,
    Invoice,
    Inventory,
    InventoryTransaction,
    FollowUp,
    SmsLog
};
