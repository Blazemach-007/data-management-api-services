'use client';

import { useState, useEffect, FormEvent } from 'react';
import { getCustomers, CustomerData } from '@/services/customerService';
import { getEmployees, EmployeeData } from '@/services/employeeService';
import { api } from '@/services/transactionService';

type TabType = 'fastag' | 'aadhaar' | 'insurance' | 'other';

export default function TransactionPage() {
    const [activeTab, setActiveTab] = useState<TabType>('fastag');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Context Data
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [employees, setEmployees] = useState<EmployeeData[]>([]);
    
    // Selections
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        amount_paid: 0,
        vehicle_number: '',
        vehicle_type: 'Car',
        policy_number: '',
        insurance_provider: '',
        policy_type: 'Vehicle',
        expiry_date: '',
        aadhaar_number: '',
        service_type: 'Update',
        service_name: '',
        description: ''
    });

    useEffect(() => {
        getCustomers().then(setCustomers).catch(console.error);
        getEmployees().then(setEmployees).catch(console.error);
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId || !selectedEmployeeId) {
            setMessage({ text: "⚠️ Please select both an Employee and a Customer first.", type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const basePayload = {
                customer_id: selectedCustomerId,
                employee_id: selectedEmployeeId,
                amount_paid: Number(formData.amount_paid)
            };

            if (activeTab === 'fastag') {
                await api.fastag({ 
                    ...basePayload, 
                    vehicle_number: formData.vehicle_number,
                    vehicle_type: formData.vehicle_type
                });
            } else if (activeTab === 'insurance') {
                await api.insurance({
                    ...basePayload,
                    policy_number: formData.policy_number,
                    insurance_provider: formData.insurance_provider,
                    policy_type: formData.policy_type,
                    expiry_date: formData.expiry_date
                });
            } else if (activeTab === 'aadhaar') {
                await api.aadhaar({
                    ...basePayload,
                    aadhaar_number: formData.aadhaar_number,
                    service_type: formData.service_type
                });
            } else {
                await api.other({
                    ...basePayload,
                    service_name: formData.service_name,
                    description: formData.description
                });
            }

            setMessage({ text: '✅ Transaction Saved Successfully!', type: 'success' });
            setFormData(prev => ({ ...prev, amount_paid: 0 }));
            
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleInput = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <main style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                
                {/* HEADER */}
                <div style={styles.header}>
                    <h1 style={styles.title}>New Service Transaction</h1>
                    <p style={styles.subtitle}>Record a new customer service request</p>
                </div>

                {/* --- CONTEXT CARD (Selection) --- */}
                <div style={styles.card}>
                    <div style={styles.gridTwo}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Logged in Employee</label>
                            <select 
                                style={styles.select}
                                value={selectedEmployeeId}
                                onChange={e => setSelectedEmployeeId(e.target.value)}
                            >
                                <option value="">-- Select Your Name --</option>
                                {employees.map(e => (
                                    <option key={e.id} value={e.id}>{e.full_name} ({e.email})</option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Customer</label>
                            <select 
                                style={styles.select}
                                value={selectedCustomerId}
                                onChange={e => setSelectedCustomerId(e.target.value)}
                            >
                                <option value="">-- Select Customer --</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.full_name} ({c.phone_number})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- TABS --- */}
                <div style={styles.tabContainer}>
                    {['fastag', 'aadhaar', 'insurance', 'other'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as TabType)}
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab ? styles.activeTab : styles.inactiveTab)
                            }}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* --- FORM BODY --- */}
                <div style={styles.formContainer}>
                    
                    {/* Alert Message */}
                    {message.text && (
                        <div style={{
                            ...styles.alert,
                            ...(message.type === 'success' ? styles.alertSuccess : styles.alertError)
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        
                        {/* FORM CONTENT */}
                        <div style={styles.formContent}>
                            
                            {/* FASTAG FIELDS */}
                            {activeTab === 'fastag' && (
                                <div style={styles.gridTwo}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Vehicle Number</label>
                                        <input name="vehicle_number" placeholder="KA-01-AB-1234" required type="text" style={styles.input} onChange={handleInput} />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Vehicle Type</label>
                                        <select name="vehicle_type" style={styles.input} onChange={handleInput}>
                                            <option value="Car">Car / Jeep / Van</option>
                                            <option value="Truck">Light Commercial Vehicle</option>
                                            <option value="Bus">Bus / Truck (3 Axle)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* AADHAAR FIELDS */}
                            {activeTab === 'aadhaar' && (
                                <div style={styles.gridTwo}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Aadhaar Number (12 Digits)</label>
                                        <input name="aadhaar_number" required type="text" maxLength={12} placeholder="XXXX XXXX XXXX" style={styles.input} onChange={handleInput} />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Service Request</label>
                                        <select name="service_type" style={styles.input} onChange={handleInput}>
                                            <option value="Update">Biometric/Detail Update</option>
                                            <option value="New">New Enrollment</option>
                                            <option value="Print">PVC Card Print</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* INSURANCE FIELDS */}
                            {activeTab === 'insurance' && (
                                <div style={styles.gridTwo}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Policy Number</label>
                                        <input name="policy_number" required type="text" style={styles.input} onChange={handleInput} />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Insurance Provider</label>
                                        <input name="insurance_provider" placeholder="Ex: HDFC Ergo" required type="text" style={styles.input} onChange={handleInput} />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Policy Type</label>
                                        <select name="policy_type" style={styles.input} onChange={handleInput}>
                                            <option value="Vehicle">Vehicle Insurance</option>
                                            <option value="Health">Health Insurance</option>
                                            <option value="Life">Life Insurance</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Policy Expiry Date</label>
                                        <input name="expiry_date" required type="date" style={styles.input} onChange={handleInput} />
                                    </div>
                                </div>
                            )}

                            {/* OTHER FIELDS */}
                            {activeTab === 'other' && (
                                <div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Service Name</label>
                                        <input name="service_name" placeholder="Ex: PAN Card, Passport Application" required type="text" style={styles.input} onChange={handleInput} />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Description / Notes</label>
                                        <textarea name="description" rows={3} style={styles.textarea} placeholder="Enter details about the service..." onChange={handleInput}></textarea>
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr style={styles.divider} />

                        {/* COMMON: AMOUNT */}
                        <div style={styles.amountBox}>
                            <div style={styles.amountLabelContainer}>
                                <label style={styles.amountLabel}>TOTAL AMOUNT (₹)</label>
                                <span style={styles.amountSubtext}>Enter the final amount collected.</span>
                            </div>
                            <div style={styles.amountInputContainer}>
                                <input 
                                    name="amount_paid" 
                                    type="number" 
                                    required 
                                    min="0"
                                    placeholder="0.00"
                                    value={formData.amount_paid}
                                    style={styles.amountInput}
                                    onChange={handleInput}
                                />
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{
                                ...styles.button,
                                ...(loading ? styles.buttonDisabled : styles.buttonEnabled)
                            }}
                        >
                            {loading ? 'Processing...' : `Submit ${activeTab.toUpperCase()} Transaction`}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

// --- STANDARD CSS STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc', // Light gray background
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    contentWrapper: {
        maxWidth: '800px',
        margin: '0 auto'
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px'
    },
    title: {
        fontSize: '2rem',
        fontWeight: '800',
        color: '#1e293b',
        margin: '0 0 10px 0'
    },
    subtitle: {
        color: '#64748b',
        margin: 0
    },
    // Context Card
    card: {
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        marginBottom: '30px'
    },
    // Tabs
    tabContainer: {
        display: 'flex',
        gap: '4px',
        paddingLeft: '10px'
    },
    tab: {
        padding: '12px 24px',
        border: 'none',
        borderRadius: '8px 8px 0 0',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        letterSpacing: '0.05em'
    },
    activeTab: {
        backgroundColor: '#2563eb', // Blue
        color: '#ffffff',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.05)'
    },
    inactiveTab: {
        backgroundColor: '#e2e8f0', // Light gray
        color: '#64748b'
    },
    // Form Body
    formContainer: {
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '0 12px 12px 12px', // Top left corner sharp to match active tab
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
    },
    formContent: {
        marginBottom: '30px' // Spacing between fields and amount section
    },
    // Grid System
    gridTwo: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '10px'
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#475569'
    },
    input: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        width: '100%',
        boxSizing: 'border-box'
    },
    select: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '1rem',
        width: '100%',
        backgroundColor: '#f8fafc',
        boxSizing: 'border-box'
    },
    textarea: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '1rem',
        width: '100%',
        minHeight: '80px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box'
    },
    divider: {
        border: 'none',
        borderTop: '1px solid #e2e8f0',
        margin: '30px 0'
    },
    // Amount Section
    amountBox: {
        backgroundColor: '#ecfdf5', // Light green
        border: '1px solid #a7f3d0',
        borderRadius: '8px',
        padding: '25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '30px'
    },
    amountLabelContainer: {
        flex: 1,
        minWidth: '200px'
    },
    amountLabel: {
        display: 'block',
        color: '#065f46',
        fontWeight: '800',
        fontSize: '1.1rem',
        marginBottom: '4px'
    },
    amountSubtext: {
        color: '#059669',
        fontSize: '0.85rem'
    },
    amountInputContainer: {
        flex: 2,
        minWidth: '200px'
    },
    amountInput: {
        width: '100%',
        padding: '15px',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#064e3b',
        border: '2px solid #34d399',
        borderRadius: '8px',
        textAlign: 'right',
        boxSizing: 'border-box'
    },
    // Buttons
    button: {
        width: '100%',
        padding: '16px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 0.1s ease'
    },
    buttonEnabled: {
        backgroundColor: '#2563eb', // Blue
        boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)'
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
        cursor: 'not-allowed'
    },
    // Alerts
    alert: {
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        fontWeight: '500'
    },
    alertSuccess: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        border: '1px solid #bbf7d0'
    },
    alertError: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fecaca'
    }
};