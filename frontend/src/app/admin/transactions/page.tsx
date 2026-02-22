'use client';

import { useState, useEffect } from 'react';
import { getTransactions } from '@/services/transactionService';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        getTransactions()
            .then(data => setTransactions(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // --- FILTERING LOGIC ---
    const filteredTransactions = transactions.filter(tx => {
        // 1. Text Search (Matches Customer Name, Employee Name, or ID)
        const searchLower = searchTerm.toLowerCase();
        const customerName = tx.Customer?.full_name?.toLowerCase() || '';
        const employeeName = tx.Employee?.full_name?.toLowerCase() || '';
        
        const matchesText = 
            customerName.includes(searchLower) ||
            employeeName.includes(searchLower) ||
            tx.id.toLowerCase().includes(searchLower);

        // 2. Category Filter
        const matchesCategory = filterCategory ? tx.service_category === filterCategory : true;

        // 3. Date Filter
        let matchesDate = true;
        if (startDate || endDate) {
            const txDate = new Date(tx.createdAt);
            txDate.setHours(0, 0, 0, 0);

            if (startDate && txDate < new Date(startDate)) matchesDate = false;
            if (endDate && txDate > new Date(endDate)) matchesDate = false;
        }

        return matchesText && matchesCategory && matchesDate;
    });

    return (
        <main style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <h1 style={styles.title}>All Transactions</h1>
                    <p style={styles.subtitle}>View and filter all employee activities</p>
                </div>

                {/* --- FILTERS --- */}
                <div style={styles.card}>
                    <div style={styles.gridFour}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Search</label>
                            <input 
                                type="text" 
                                placeholder="Customer or Employee Name..." 
                                style={styles.input}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Service Type</label>
                            <select style={styles.input} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                <option value="">All Services</option>
                                <option value="FASTAG">Fastag</option>
                                <option value="INSURANCE">Insurance</option>
                                <option value="AADHAAR">Aadhaar</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>From Date</label>
                            <input type="date" style={styles.input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>To Date</label>
                            <input type="date" style={styles.input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* --- DATA TABLE --- */}
                <div style={{...styles.card, padding: 0, overflow: 'hidden'}}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead style={styles.tableHead}>
                                <tr>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Service</th>
                                    <th style={styles.th}>Customer</th>
                                    <th style={styles.th}>Processed By</th>
                                    <th style={styles.th}>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} style={styles.tdCenter}>Loading records...</td></tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr><td colSpan={5} style={styles.tdCenter}>No transactions found matching criteria.</td></tr>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx.id} style={styles.tr}>
                                            <td style={styles.td}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    ...(tx.service_category === 'FASTAG' ? styles.badgeFastag : 
                                                        tx.service_category === 'INSURANCE' ? styles.badgeInsurance :
                                                        tx.service_category === 'AADHAAR' ? styles.badgeAadhaar : styles.badgeOther)
                                                }}>
                                                    {tx.service_category}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <strong>{tx.Customer?.full_name}</strong><br/>
                                                <span style={styles.subText}>{tx.Customer?.phone_number}</span>
                                            </td>
                                            <td style={styles.td}>
                                                {tx.Employee?.full_name}
                                            </td>
                                            <td style={{...styles.td, fontWeight: 'bold', color: '#059669', fontSize: '1.1rem'}}>
                                                ₹{tx.amount_paid}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={styles.footer}>
                        Showing {filteredTransactions.length} of {transactions.length} total transactions
                    </div>
                </div>

            </div>
        </main>
    );
}

// --- STANDARD CSS STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' },
    contentWrapper: { maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    title: { fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: '0 0 5px 0' },
    subtitle: { color: '#64748b', margin: 0 },
    card: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', marginBottom: '25px' },
    gridFour: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '0.85rem', fontWeight: '600', color: '#475569' },
    input: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', backgroundColor: '#f8fafc' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    tableHead: { backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' },
    th: { padding: '16px', color: '#334155', fontWeight: '600', fontSize: '0.9rem' },
    td: { padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#1e293b', fontSize: '0.95rem' },
    tr: { transition: 'background-color 0.1s' },
    tdCenter: { padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '500' },
    badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' },
    badgeFastag: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
    badgeInsurance: { backgroundColor: '#fce7f3', color: '#be185d' },
    badgeAadhaar: { backgroundColor: '#fef3c7', color: '#b45309' },
    badgeOther: { backgroundColor: '#f3f4f6', color: '#374151' },
    subText: { fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'block' },
    footer: { padding: '15px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }
};