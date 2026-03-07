'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCustomer, updateCustomer } from '@/services/serviceApi';

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<any>({});
    const [msg, setMsg] = useState('');

    useEffect(() => {
        getCustomer(id).then(d => { setData(d); setForm(d.customer); }).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    const handleSave = async () => {
        try { await updateCustomer(id, form); setMsg('✅ Saved'); setEditing(false); getCustomer(id).then(setData); }
        catch (err: any) { setMsg('❌ ' + err.message); }
    };

    const svcSections = [
        { key: 'fastag', label: '🚗 Fastag', cols: ['vehicle_number', 'vehicle_type', 'bank', 'amount', 'status'] },
        { key: 'pancard', label: '🪪 PAN Card', cols: ['applicant_name', 'pan_number', 'form_type', 'amount', 'status'] },
        { key: 'dsc', label: '🔐 DSC', cols: ['cert_type', 'serial_number', 'expiry_date', 'amount', 'status'] },
        { key: 'insurance', label: '🛡️ Insurance', cols: ['policy_number', 'provider', 'expiry_date', 'amount', 'status'] },
        { key: 'aadhaar', label: '📋 Aadhaar', cols: ['aadhaar_number', 'update_type', 'amount', 'status'] },
        { key: 'other', label: '📦 Other', cols: ['service_name', 'description', 'amount', 'status'] },
    ];

    const statusColor: any = { Completed: '#16a34a', Active: '#16a34a', Rejected: '#dc2626', Expired: '#dc2626', Pending: '#d97706', Submitted: '#2563eb' };

    if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading...</div>;
    if (!data) return <div style={{ textAlign: 'center', padding: 60, color: '#dc2626' }}>Customer not found</div>;

    const c = data.customer;

    return (
        <div style={pg.wrap}>
            <button onClick={() => router.back()} style={pg.backBtn}>← Back</button>

            {msg && <div style={{ ...pg.alert, backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b' }}>{msg}</div>}

            {/* Customer Card */}
            <div style={pg.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                        <div style={pg.avatar}>{c.full_name?.charAt(0).toUpperCase()}</div>
                        <h1 style={pg.name}>{c.full_name}</h1>
                        <p style={pg.phone}>{c.phone_number}</p>
                    </div>
                    {!editing && <button onClick={() => setEditing(true)} style={pg.editBtn}>Edit Customer</button>}
                </div>
                {editing ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[{ name: 'full_name', label: 'Full Name' }, { name: 'phone_number', label: 'Phone' }, { name: 'email', label: 'Email' }, { name: 'address', label: 'Address' }, { name: 'pincode', label: 'Pincode' }].map(f => (
                            <div key={f.name}>
                                <label style={pg.label}>{f.label}</label>
                                <input value={form[f.name] || ''} onChange={e => setForm((x: any) => ({ ...x, [f.name]: e.target.value }))} style={pg.input} />
                            </div>
                        ))}
                        <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                            <button onClick={handleSave} style={pg.saveBtn}>Save</button>
                            <button onClick={() => setEditing(false)} style={pg.cancelBtn}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[['Email', c.email], ['Address', c.address], ['Pincode', c.pincode], ['Member since', new Date(c.createdAt).toLocaleDateString('en-IN')]].map(([k, v]) => v ? (
                            <div key={k as string}><span style={pg.fieldLabel}>{k}</span><span style={pg.fieldVal}>{v as string}</span></div>
                        ) : null)}
                    </div>
                )}
            </div>

            {/* Services */}
            {svcSections.map(sec => {
                const items = data.services?.[sec.key] || [];
                if (items.length === 0) return null;
                return (
                    <div key={sec.key} style={pg.section}>
                        <h2 style={pg.sectionTitle}>{sec.label} <span style={pg.count}>{items.length}</span></h2>
                        <div style={pg.tableWrap}><table style={pg.table}>
                            <thead><tr style={pg.thead}>{sec.cols.map(col => <th key={col} style={pg.th}>{col.replace(/_/g, ' ')}</th>)}<th style={pg.th}>Date</th></tr></thead>
                            <tbody>{items.map((item: any) => (
                                <tr key={item.id} style={pg.tr}>{sec.cols.map(col => (
                                    <td key={col} style={pg.td}>
                                        {col === 'status' ? <span style={{ ...pg.badge, color: statusColor[item[col]] || '#64748b', backgroundColor: (statusColor[item[col]] || '#64748b') + '20' }}>{item[col]}</span>
                                            : col === 'amount' ? <strong>₹{item[col]?.toLocaleString()}</strong>
                                            : item[col] || '-'}
                                    </td>
                                ))}<td style={pg.td}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</td></tr>
                            ))}</tbody>
                        </table></div>
                    </div>
                );
            })}

            {/* Recent Transactions */}
            {data.transactions?.length > 0 && (
                <div style={pg.section}>
                    <h2 style={pg.sectionTitle}>💳 Transactions <span style={pg.count}>{data.transactions.length}</span></h2>
                    <div style={pg.tableWrap}><table style={pg.table}>
                        <thead><tr style={pg.thead}>{['Type', 'Amount', 'Payment', 'Status', 'Date'].map(h => <th key={h} style={pg.th}>{h}</th>)}</tr></thead>
                        <tbody>{data.transactions.map((t: any) => (
                            <tr key={t.id} style={pg.tr}>
                                <td style={pg.td}>{t.service_type}</td>
                                <td style={pg.td}><strong>₹{t.amount?.toLocaleString()}</strong></td>
                                <td style={pg.td}>{t.payment_method}</td>
                                <td style={pg.td}><span style={{ ...pg.badge, color: t.payment_status === 'Paid' ? '#16a34a' : '#d97706', backgroundColor: t.payment_status === 'Paid' ? '#dcfce7' : '#fff7ed' }}>{t.payment_status}</span></td>
                                <td style={pg.td}>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                            </tr>
                        ))}</tbody>
                    </table></div>
                </div>
            )}
        </div>
    );
}

const pg: any = {
    wrap: { padding: 24, maxWidth: 1200, margin: '0 auto' },
    backBtn: { backgroundColor: 'transparent', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 16, fontWeight: 600 },
    alert: { padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 },
    avatar: { width: 56, height: 56, borderRadius: '50%', backgroundColor: '#1e3a5f', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: 10 },
    name: { fontSize: '1.4rem', fontWeight: 800, color: '#1e3a5f', margin: '0 0 4px' },
    phone: { color: '#64748b', margin: 0, fontSize: '1rem' },
    editBtn: { backgroundColor: '#1e3a5f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
    label: { fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 },
    input: { padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, width: '100%', boxSizing: 'border-box', fontSize: '0.9rem' },
    saveBtn: { backgroundColor: '#1e3a5f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
    cancelBtn: { backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
    fieldLabel: { fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', display: 'block' },
    fieldVal: { fontSize: '0.9rem', color: '#1e293b' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: '1.1rem', fontWeight: 800, color: '#1e3a5f', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 },
    count: { backgroundColor: '#1e3a5f', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: '0.75rem' },
    tableWrap: { overflowX: 'auto', backgroundColor: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#1e3a5f' },
    th: { padding: '10px 14px', textAlign: 'left', color: '#fff', fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '10px 14px', fontSize: '0.85rem', color: '#334155' },
    badge: { padding: '2px 8px', borderRadius: 20, fontWeight: 700, fontSize: '0.75rem' }
};
