'use client';
import { useState, useEffect } from 'react';
import { getInventory, createInventory, updateInventory, stockTransaction } from '@/services/serviceApi';

const emptyItem = { item_name: '', category: '', quantity: 0, unit: 'pcs', min_stock_alert: 5, notes: '' };

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(emptyItem);
    const [txnModal, setTxnModal] = useState<any>(null);
    const [txnForm, setTxnForm] = useState({ type: 'in', quantity: 1, reason: '' });
    const [msg, setMsg] = useState('');

    const load = () => { setLoading(true); getInventory().then(setItems).catch(console.error).finally(() => setLoading(false)); };
    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm(emptyItem); setShowForm(true); };
    const openEdit = (item: any) => { setEditing(item); setForm({ ...item }); setShowForm(true); };
    const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: any) => {
        e.preventDefault(); setMsg('');
        try {
            if (editing) await updateInventory(editing.id, form);
            else await createInventory(form);
            setMsg(editing ? '✅ Updated' : '✅ Item added'); setShowForm(false); load();
        } catch (err: any) { setMsg('❌ ' + err.message); }
    };

    const handleStockTxn = async (e: any) => {
        e.preventDefault(); setMsg('');
        try {
            await stockTransaction(txnModal.id, txnForm);
            setMsg(`✅ Stock ${txnForm.type === 'in' ? 'added' : 'removed'}`);
            setTxnModal(null); load();
        } catch (err: any) { setMsg('❌ ' + err.message); }
    };

    return (
        <div style={pg.wrap}>
            <div style={pg.header}>
                <div><h1 style={pg.title}>📦 Inventory</h1><p style={pg.sub}>{items.length} items tracked</p></div>
                <button onClick={openAdd} style={pg.addBtn}>+ Add Item</button>
            </div>

            {msg && <div style={{ ...pg.alert, backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b' }}>{msg}</div>}

            {showForm && (
                <div style={pg.modal}><div style={pg.modalBox}>
                    <h2 style={pg.modalTitle}>{editing ? 'Edit' : 'Add'} Item</h2>
                    <form onSubmit={handleSubmit} style={pg.form}>
                        {[
                            { name: 'item_name', label: 'Item Name *', required: true },
                            { name: 'category', label: 'Category' },
                            { name: 'quantity', label: 'Initial Quantity', type: 'number' },
                            { name: 'unit', label: 'Unit (pcs, box, etc.)' },
                            { name: 'min_stock_alert', label: 'Low Stock Alert At', type: 'number' },
                        ].map(f => <div key={f.name}><label style={pg.label}>{f.label}</label><input name={f.name} value={form[f.name]} onChange={handleChange} required={f.required} type={f.type || 'text'} style={pg.input} /></div>)}
                        <label style={pg.label}>Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} style={{ ...pg.input, height: 60 }} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button type="submit" style={pg.addBtn}>Save</button>
                            <button type="button" onClick={() => setShowForm(false)} style={pg.cancelBtn}>Cancel</button>
                        </div>
                    </form>
                </div></div>
            )}

            {txnModal && (
                <div style={pg.modal}><div style={pg.modalBox}>
                    <h2 style={pg.modalTitle}>Stock Update: {txnModal.item_name}</h2>
                    <p style={{ color: '#64748b', marginBottom: 16 }}>Current stock: <strong>{txnModal.quantity} {txnModal.unit}</strong></p>
                    <form onSubmit={handleStockTxn} style={pg.form}>
                        <label style={pg.label}>Type</label>
                        <select value={txnForm.type} onChange={e => setTxnForm(f => ({ ...f, type: e.target.value }))} style={pg.input}>
                            <option value="in">Stock In (+)</option>
                            <option value="out">Stock Out (-)</option>
                        </select>
                        <label style={pg.label}>Quantity</label>
                        <input type="number" min="1" value={txnForm.quantity} onChange={e => setTxnForm(f => ({ ...f, quantity: Number(e.target.value) }))} style={pg.input} required />
                        <label style={pg.label}>Reason</label>
                        <input value={txnForm.reason} onChange={e => setTxnForm(f => ({ ...f, reason: e.target.value }))} style={pg.input} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button type="submit" style={pg.addBtn}>Confirm</button>
                            <button type="button" onClick={() => setTxnModal(null)} style={pg.cancelBtn}>Cancel</button>
                        </div>
                    </form>
                </div></div>
            )}

            {loading ? <p style={pg.loading}>Loading...</p> : (
                <div style={pg.tableWrap}><table style={pg.table}>
                    <thead><tr style={pg.thead}>{['Item', 'Category', 'Stock', 'Unit', 'Min Alert', 'Notes', 'Actions'].map(h => <th key={h} style={pg.th}>{h}</th>)}</tr></thead>
                    <tbody>
                        {items.length === 0 ? <tr><td colSpan={7} style={pg.empty}>No items in inventory</td></tr>
                            : items.map(item => (
                                <tr key={item.id} style={pg.tr}>
                                    <td style={pg.td}><strong style={{ color: '#1e3a5f' }}>{item.item_name}</strong></td>
                                    <td style={pg.td}>{item.category || '-'}</td>
                                    <td style={pg.td}>
                                        <span style={{ ...pg.badge, backgroundColor: item.quantity <= item.min_stock_alert ? '#fee2e2' : '#dcfce7', color: item.quantity <= item.min_stock_alert ? '#dc2626' : '#16a34a', fontSize: '1rem' }}>
                                            {item.quantity}
                                        </span>
                                        {item.quantity <= item.min_stock_alert && <span style={{ ...pg.badge, backgroundColor: '#fff7ed', color: '#d97706', marginLeft: 6, fontSize: '0.7rem' }}>LOW</span>}
                                    </td>
                                    <td style={pg.td}>{item.unit}</td>
                                    <td style={pg.td}>{item.min_stock_alert}</td>
                                    <td style={pg.td}>{item.notes || '-'}</td>
                                    <td style={pg.td}>
                                        <button onClick={() => setTxnModal(item)} style={pg.txnBtn}>±Stock</button>
                                        <button onClick={() => openEdit(item)} style={pg.editBtn}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table></div>
            )}
        </div>
    );
}

const pg: any = {
    wrap: { padding: 24, maxWidth: 1200, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
    title: { fontSize: '1.5rem', fontWeight: 800, color: '#1e3a5f', margin: 0 },
    sub: { color: '#64748b', margin: '4px 0 0', fontSize: '0.9rem' },
    addBtn: { backgroundColor: '#1e3a5f', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
    cancelBtn: { backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '9px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
    alert: { padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
    modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modalBox: { backgroundColor: '#fff', padding: 28, borderRadius: 12, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' },
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
    badge: { padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: '0.82rem', display: 'inline-block' },
    txnBtn: { backgroundColor: '#1e3a5f20', color: '#1e3a5f', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginRight: 4 },
    editBtn: { backgroundColor: '#f59e0b20', color: '#d97706', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' },
    loading: { textAlign: 'center', color: '#64748b', padding: 40 },
    empty: { textAlign: 'center', color: '#94a3b8', padding: 30 }
};
