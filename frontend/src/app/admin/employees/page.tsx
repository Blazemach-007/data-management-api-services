'use client';

import { useState, useEffect, FormEvent } from 'react';
import { getEmployees, createEmployee, deleteEmployee, EmployeeData } from '@/services/employeeService';

export default function EmployeeManagementPage() {
    const [employees, setEmployees] = useState<EmployeeData[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState<EmployeeData>({ email: '', password: '', full_name: '', role: 'staff' });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const data = await getEmployees();
            setEmployees(data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.password) return alert('Password is required');
        try {
            await createEmployee(formData);
            alert('User created successfully!');
            setFormData({ email: '', password: '', full_name: '', role: 'staff' }); 
            loadData(); 
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this user?')) return;
        try { await deleteEmployee(id); loadData(); } 
        catch (err) { alert('Failed to delete user'); }
    };

    return (
        <main style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Employee Management</h1>
                    <p style={styles.subtitle}>Add and remove system users</p>
                </div>

                <div style={styles.gridTwo}>
                    {/* LEFT COLUMN: Add Form */}
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>Add New User</h2>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input required style={styles.input} placeholder="Ex: John Doe" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Email</label>
                                <input required type="email" style={styles.input} placeholder="Ex: johndoe@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Password</label>
                                <input required type="password" style={styles.input} placeholder="********" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Role</label>
                                <select style={styles.input} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as 'admin'|'staff'})}>
                                    <option value="staff">Staff (Standard Access)</option>
                                    <option value="admin">Admin (Full Control)</option>
                                </select>
                            </div>
                            <button type="submit" style={styles.button}>Create User</button>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: Employee List */}
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>Current Users ({employees.length})</h2>
                        {loading ? <p style={styles.loading}>Loading...</p> : (
                            <ul style={styles.list}>
                                {employees.length === 0 && <p style={styles.loading}>No users found.</p>}
                                {employees.map(emp => (
                                    <li key={emp.id} style={styles.listItem}>
                                        <div>
                                            <p style={styles.listTitle}>{emp.full_name}</p>
                                            <p style={styles.listSubtitle}>
                                                {emp.email} • 
                                                <span style={emp.role === 'admin' ? styles.badgeAdmin : styles.badgeStaff}>
                                                    {emp.role.toUpperCase()}
                                                </span>
                                            </p>
                                        </div>
                                        <button onClick={() => emp.id && handleDelete(emp.id)} style={styles.deleteBtn}>
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
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
    gridTwo: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' },
    card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', height: 'fit-content' },
    sectionTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#334155', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '0.85rem', fontWeight: '600', color: '#475569' },
    input: { padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' },
    button: { padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
    loading: { color: '#64748b', textAlign: 'center', padding: '20px' },
    list: { listStyle: 'none', padding: 0, margin: 0, maxHeight: '600px', overflowY: 'auto' },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px' },
    listTitle: { margin: '0 0 4px 0', fontWeight: 'bold', color: '#1e293b' },
    listSubtitle: { margin: 0, fontSize: '0.85rem', color: '#64748b' },
    badgeAdmin: { marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f3e8ff', color: '#7e22ce', fontSize: '0.7rem', fontWeight: 'bold' },
    badgeStaff: { marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#e0e7ff', color: '#4f46e5', fontSize: '0.7rem', fontWeight: 'bold' },
    deleteBtn: { padding: '6px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }
};