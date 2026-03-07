'use client';
import { useState, useEffect } from 'react';
import { getTransactions, generateInvoice } from '@/services/serviceApi';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export default function BillingPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);
    const [msg, setMsg] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        getTransactions().then((data: any) => {
            setTransactions(Array.isArray(data) ? data : data?.transactions || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleGenerate = async (txnId: string) => {
        setGenerating(txnId); setMsg('');
        try {
            const result = await generateInvoice(txnId);
            setMsg('✅ Invoice generated');
            if (result.pdf_path) window.open(`${API}/${result.pdf_path}`, '_blank');
            else if (result.invoice?.pdf_path) window.open(`${API}/${result.invoice.pdf_path}`, '_blank');
        } catch (err: any) { setMsg('❌ ' + err.message); }
        finally { setGenerating(null); }
    };

    const filtered = transactions.filter(t =>
        (t.Customer?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        t.service_type?.toLowerCase().includes(search.toLowerCase())
    );

    const paymentColor: any = { Paid: '#16a34a', Pending: '#d97706', Failed: '#dc2626' };

    return (
        <div style={pg.wrap}>
            <div style={pg.header}>
                <div>
                    <h1 style={pg.title}>🧾 Billing & Invoices</h1>
                    <p style={pg.sub}>{transactions.length} transactions</p>
                </div>
                <input placeholder="Search customer or service..." value={search} onChange={e => setSearch(e.target.value)} style={pg.searchInput} />
            </div>

            {msg && <div style={{ ...pg.alert, backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b' }}>{msg}</div>}

            {loading ? <p style={pg.loading}>Loading...</p> : (
                <div style={pg.tableWrap}><table style={pg.table}>
                    <thead><tr style={pg.thead}>{['Customer', 'Service', 'Amount', 'Payment Method', 'Status', 'Date', 'Invoice'].map(h => <th key={h} style={pg.th}>{h}</th>)}</tr></thead>
                    <tbody>
                        {filtered.length === 0 ? <tr><td colSpan={7} style={pg.empty}>No transactions found</td></tr>
                            : filtered.map(t => (
                                <tr key={t.id} style={pg.tr}>
                                    <td style={pg.td}><div style={pg.name}>{t.Customer?.full_name || '-'}</div><div style={pg.phone}>{t.Customer?.phone_number}</div></td>
                                    <td style={pg.td}><span style={{ ...pg.badge, backgroundColor: '#eff6ff', color: '#2563eb' }}>{t.service_type}</span></td>
                                    <td style={pg.td}><strong>₹{t.amount?.toLocaleString()}</strong></td>
                                    <td style={pg.td}>{t.payment_method}</td>
                                    <td style={pg.td}><span style={{ ...pg.badge, color: paymentColor[t.payment_status] || '#64748b', backgroundColor: (paymentColor[t.payment_status] || '#64748b') + '20' }}>{t.payment_status}</span></td>
                                    <td style={pg.td}>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td style={pg.td}>
                                        <button
                                            onClick={() => handleGenerate(t.id)}
                                            disabled={generating === t.id}
                                            style={{ ...pg.genBtn, opacity: generating === t.id ? 0.6 : 1 }}
                                        >
                                            {generating === t.id ? '...' : '📄 PDF'}
                                        </button>
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
    wrap: { padding: 24, maxWidth: 1300, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
    title: { fontSize: '1.5rem', fontWeight: 800, color: '#1e3a5f', margin: 0 },
    sub: { color: '#64748b', margin: '4px 0 0', fontSize: '0.9rem' },
    searchInput: { padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', width: 280 },
    alert: { padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
    tableWrap: { overflowX: 'auto', backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#1e3a5f' },
    th: { padding: '12px 14px', textAlign: 'left', color: '#fff', fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '11px 14px', fontSize: '0.87rem', color: '#334155' },
    name: { fontWeight: 700, color: '#1e3a5f' },
    phone: { color: '#94a3b8', fontSize: '0.78rem' },
    badge: { padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: '0.78rem' },
    genBtn: { backgroundColor: '#1e3a5f', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
    loading: { textAlign: 'center', color: '#64748b', padding: 40 },
    empty: { textAlign: 'center', color: '#94a3b8', padding: 30 }
};
