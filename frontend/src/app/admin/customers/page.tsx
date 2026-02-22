'use client';

import { useState, useEffect } from 'react';
import { getCustomers, CustomerData } from '@/services/customerService';

export default function AdminCustomerPage() {
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchText, setSearchText] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        getCustomers().then(setCustomers).catch(console.error).finally(() => setLoading(false));
    }, []);

    const filteredCustomers = customers.filter(customer => {
        const searchLower = searchText.toLowerCase();
        const matchesText = 
            customer.full_name.toLowerCase().includes(searchLower) ||
            customer.phone_number.includes(searchText) ||
            (customer.email || '').toLowerCase().includes(searchLower);

        let matchesDate = true;
        if (startDate || endDate) {
            const customerDate = new Date(customer.createdAt || '');
            customerDate.setHours(0, 0, 0, 0);

            if (startDate && customerDate < new Date(startDate)) matchesDate = false;
            if (endDate && customerDate > new Date(endDate)) matchesDate = false;
        }
        return matchesText && matchesDate;
    });

    return (
        <main style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Customer Records</h1>
                    <p style={styles.subtitle}>Manage and view all registered customers</p>
                </div>

                {/* FILTERS */}
                <div style={styles.card}>
                    <div style={styles.gridThree}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Search Details</label>
                            <input type="text" placeholder="Name, Phone, or Email..." style={styles.input} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
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

                {/* TABLE */}
                <div style={{...styles.card, padding: 0, overflow: 'hidden'}}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead style={styles.tableHead}>
                                <tr>
                                    <th style={styles.th}>Full Name</th>
                                    <th style={styles.th}>Phone</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Location</th>
                                    <th style={styles.th}>Joined Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} style={styles.tdCenter}>Loading...</td></tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr><td colSpan={5} style={styles.tdCenter}>No records found.</td></tr>
                                ) : (
                                    filteredCustomers.map((c) => (
                                        <tr key={c.id} style={styles.tr}>
                                            <td style={{...styles.td, fontWeight: 'bold'}}>{c.full_name}</td>
                                            <td style={styles.td}>{c.phone_number}</td>
                                            <td style={styles.td}>{c.email || '-'}</td>
                                            <td style={styles.td}>
                                                {c.address ? `${c.address.substring(0, 20)}...` : '-'}
                                                {c.pincode && ` (${c.pincode})`}
                                            </td>
                                            <td style={styles.td}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={styles.footer}>Showing {filteredCustomers.length} of {customers.length} records</div>
                </div>
            </div>
        </main>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { padding: '40px 20px' },
    contentWrapper: { maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    title: { fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: '0 0 5px 0' },
    subtitle: { color: '#64748b', margin: 0 },
    card: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', marginBottom: '25px' },
    gridThree: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '0.85rem', fontWeight: '600', color: '#475569' },
    input: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    tableHead: { backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' },
    th: { padding: '16px', color: '#334155', fontWeight: '600', fontSize: '0.9rem' },
    td: { padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#1e293b', fontSize: '0.95rem' },
    tr: { transition: 'background-color 0.1s' },
    tdCenter: { padding: '30px', textAlign: 'center', color: '#64748b' },
    footer: { padding: '15px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b' }
};