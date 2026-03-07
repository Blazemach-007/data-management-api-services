'use client';
import { useState, useEffect } from 'react';
import { getCustomers, getInsurance, createInsurance, updateInsurance, deleteService } from '@/services/serviceApi';

const empty = { CustomerId: '', policy_number: '', provider: '', policy_type: 'Vehicle', premium: '', expiry_date: '', amount: '', status: 'Active', follow_up_status: 'None', notes: '' };

export default function InsurancePage() {
    const [records, setRecords] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(empty);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const role = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').role : '';

    const load = () => { setLoading(true); getInsurance().then(setRecords).catch(console.error).finally(() => setLoading(false)); };
    useEffect(() => { load(); getCustomers().then(setCustomers).catch(console.error); }, []);

    const openAdd = () => { setEditing(null); setForm(empty); setShowForm(true); };
    const openEdit = (r: any) => { setEditing(r); setForm({ ...r, CustomerId: r.Customer?.id || r.CustomerId, amount: r.amount?.toString() || '', premium: r.premium?.toString() || '' }); setShowForm(true); };
    const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: any) => {
        e.preventDefault(); setMsg('');
        try {
            const payload = { ...form, amount: parseFloat(form.amount), premium: form.premium ? parseFloat(form.premium) : null };
            if (editing) await updateInsurance(editing.id, payload);
            else await createInsurance(payload);
            setMsg(editing ? '✅ Updated' : '✅ Created'); setShowForm(false); load();
        } catch (err: any) { setMsg('❌ ' + err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete?')) return;
        try { await deleteService('insurance', id); load(); } catch (err: any) { setMsg('❌ ' + err.message); }
    };

    const daysToExpiry = (d: string) => d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null;
    const expiryBadge = (d: string) => {
        const days = daysToExpiry(d);
        if (days === null) return {};
        if (days < 0) return { bg: '#fee2e2', color: '#dc2626', label: 'Expired' };
        if (days <= 30) return { bg: '#fff7ed', color: '#d97706', label: `${days}d` };
        return { bg: '#dcfce7', color: '#16a34a', label: `${days}d` };
    };

    const filtered = records.filter(r => {
        const matchSearch = (r.Customer?.full_name || '').toLowerCase().includes(search.toLowerCase()) || (r.policy_number || '').toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || (filter === 'expiring' && daysToExpiry(r.expiry_date) !== null && daysToExpiry(r.expiry_date)! <= 30);
        return matchSearch && matchFilter;
    });

    return (
        <div style={pg.wrap}>
            <div style={pg.header}>
                <div><h1 style={pg.title}>🛡️ Insurance Management</h1><p style={pg.sub}>{records.length} total records</p></div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={pg.searchInput} />
                    <select value={filter} onChange={e => setFilter(e.target.value)} style={pg.searchInput}>
                        <option value="all">All</option>
                        <option value="expiring">Expiring ≤30 days</option>
                    </select>
                    <button onClick={openAdd} style={pg.addBtn}>+ Add Insurance</button>
                </div>
            </div>
            {msg && <div style={{ ...pg.alert, backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b' }}>{msg}</div>}
            {showForm && (
                <div style={pg.modal}><div style={pg.modalBox}>
                    <h2 style={pg.modalTitle}>{editing ? 'Edit' : 'Add'} Insurance</h2>
                    <form onSubmit={handleSubmit} style={pg.form}>
                        <label style={pg.label}>Customer *</label>
                        <select name="CustomerId" value={form.CustomerId} onChange={handleChange} required style={pg.input}>
                            <option value="">-- Select Customer --</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.phone_number})</option>)}
                        </select>
                        {[
                            { name: 'policy_number', label: 'Policy Number' },
                            { name: 'provider', label: 'Insurance Provider' },
                            { name: 'premium', label: 'Annual Premium (₹)', type: 'number' },
                            { name: 'expiry_date', label: 'Expiry Date', type: 'date' },
                            { name: 'amount', label: 'Amount Charged (₹) *', type: 'number', required: true },
                        ].map(f => <div key={f.name}><label style={pg.label}>{f.label}</label><input name={f.name} value={form[f.name]} onChange={handleChange} required={f.required} type={f.type || 'text'} style={pg.input} /></div>)}
                        <label style={pg.label}>Policy Type</label>
                        <select name="policy_type" value={form.policy_type} onChange={handleChange} style={pg.input}>
                            {['Life', 'Vehicle', 'Health', 'Other'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <label style={pg.label}>Status</label>
                        <select name="status" value={form.status} onChange={handleChange} style={pg.input}>
                            {['Active', 'Expired', 'Renewed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <label style={pg.label}>Follow-up Status</label>
                        <select name="follow_up_status" value={form.follow_up_status} onChange={handleChange} style={pg.input}>
                            {['None', 'Pending', 'Contacted', 'Done'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <label style={pg.label}>Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} style={{ ...pg.input, height: 60 }} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button type="submit" style={pg.addBtn}>Save</button>
                            <button type="button" onClick={() => setShowForm(false)} style={pg.cancelBtn}>Cancel</button>
                        </div>
                    </form>
                </div></div>
            )}
            {loading ? <p style={pg.loading}>Loading...</p> : (
                <div style={pg.tableWrap}><table style={pg.table}>
                    <thead><tr style={pg.thead}>{['Customer', 'Policy No', 'Provider', 'Type', 'Expires', 'Amount', 'Status', 'Follow-up', 'Actions'].map(h => <th key={h} style={pg.th}>{h}</th>)}</tr></thead>
                    <tbody>{filtered.length === 0 ? <tr><td colSpan={9} style={pg.empty}>No records found</td></tr> : filtered.map(r => {
                        const exp = expiryBadge(r.expiry_date);
                        return (
                            <tr key={r.id} style={pg.tr}>
                                <td style={pg.td}><div style={pg.name}>{r.Customer?.full_name || '-'}</div><div style={pg.phone}>{r.Customer?.phone_number}</div></td>
                                <td style={pg.td}>{r.policy_number || '-'}</td>
                                <td style={pg.td}>{r.provider || '-'}</td>
                                <td style={pg.td}>{r.policy_type}</td>
                                <td style={pg.td}>
                                    {r.expiry_date && <span style={{ ...pg.badge, backgroundColor: (exp as any).bg, color: (exp as any).color }}>{(exp as any).label}</span>}
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{r.expiry_date}</div>
                                </td>
                                <td style={pg.td}><strong>₹{r.amount?.toLocaleString()}</strong></td>
                                <td style={pg.td}><span style={{ ...pg.badge, backgroundColor: r.status === 'Active' ? '#dcfce7' : '#fee2e2', color: r.status === 'Active' ? '#16a34a' : '#dc2626' }}>{r.status}</span></td>
                                <td style={pg.td}><span style={{ ...pg.badge, backgroundColor: '#f1f5f9', color: '#64748b' }}>{r.follow_up_status}</span></td>
                                <td style={pg.td}>
                                    <button onClick={() => openEdit(r)} style={pg.editBtn}>Edit</button>
                                    {role === 'admin' && <button onClick={() => handleDelete(r.id)} style={pg.delBtn}>Del</button>}
                                </td>
                            </tr>
                        );
                    })}</tbody>
                </table></div>
            )}
        </div>
    );
}

const pg: any = {
    wrap: { padding: 24, maxWidth: 1300, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
    title: { fontSize: '1.5rem', fontWeight: 800, color: '#1e3a5f', margin: 0 },
    sub: { color: '#64748b', margin: '4px 0 0', fontSize: '0.9rem' },
    searchInput: { padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', width: 180 },
    addBtn: { backgroundColor: '#1e3a5f', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
    cancelBtn: { backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '9px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
    alert: { padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
    modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modalBox: { backgroundColor: '#fff', padding: 28, borderRadius: 12, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' },
    modalTitle: { fontSize: '1.2rem', fontWeight: 800, color: '#1e3a5f', marginBottom: 16 },
    form: { display: 'flex', flexDirection: 'column', gap: 10 },
    label: { fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: 2 },
    input: { padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
    tableWrap: { overflowX: 'auto', backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#1e3a5f' },
    th: { padding: '12px 14px', textAlign: 'left', color: '#fff', fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '11px 14px', fontSize: '0.87rem', color: '#334155' },
    name: { fontWeight: 700, color: '#1e3a5f' },
    phone: { color: '#94a3b8', fontSize: '0.78rem' },
    badge: { padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: '0.78rem' },
    editBtn: { backgroundColor: '#f59e0b20', color: '#d97706', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginRight: 4 },
    delBtn: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' },
    loading: { textAlign: 'center', color: '#64748b', padding: 40 },
    empty: { textAlign: 'center', color: '#94a3b8', padding: 30 }
};
