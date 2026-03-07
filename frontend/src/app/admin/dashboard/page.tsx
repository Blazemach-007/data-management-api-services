'use client';
import { useEffect, useState } from 'react';
import { getReportSummary, getReportMonthly, getTransactions } from '@/services/serviceApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4'];

export default function Dashboard() {
    const [summary, setSummary] = useState<any>(null);
    const [monthly, setMonthly] = useState<any[]>([]);
    const [recent, setRecent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const now = new Date();

    useEffect(() => {
        Promise.all([
            getReportSummary(),
            getReportMonthly(now.getFullYear(), now.getMonth() + 1),
            getTransactions('?limit=10')
        ]).then(([s, m, t]) => {
            setSummary(s);
            setMonthly(m);
            setRecent(Array.isArray(t) ? t.slice(0, 10) : t?.transactions?.slice(0, 10) || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={loadingStyle}>Loading Dashboard...</div>;

    const statCards = [
        { label: 'Total Customers', value: summary?.totalCustomers || 0, icon: '👥', color: '#3b82f6' },
        { label: "Today's Revenue", value: `₹${(summary?.todayRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: '#10b981' },
        { label: "Today's Services", value: summary?.todayCount || 0, icon: '📋', color: '#f59e0b' },
        { label: 'Total Revenue', value: `₹${(summary?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '📈', color: '#8b5cf6' },
    ];

    return (
        <div>
            <h1 style={pageTitle}>Dashboard</h1>
            <p style={pageSubtitle}>{now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {statCards.map(c => (
                    <div key={c.label} style={{ ...card, borderTop: `4px solid ${c.color}` }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{c.icon}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: c.color }}>{c.value}</div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            {monthly.length > 0 && (
                <div style={{ ...card, marginBottom: '28px' }}>
                    <h2 style={secTitle}>This Month's Revenue by Service</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={monthly} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <XAxis dataKey="service_type" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                            <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                                {monthly.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Recent Transactions */}
            <div style={card}>
                <h2 style={secTitle}>Recent Transactions</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={tbl}>
                        <thead>
                            <tr style={thead}>
                                <th style={th}>Customer</th>
                                <th style={th}>Service</th>
                                <th style={th}>Amount</th>
                                <th style={th}>Mode</th>
                                <th style={th}>Status</th>
                                <th style={th}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No transactions yet</td></tr>
                            ) : recent.map((t, i) => (
                                <tr key={t.id} style={i % 2 === 0 ? {} : { backgroundColor: '#f8fafc' }}>
                                    <td style={td}>{t.Customer?.full_name || '—'}</td>
                                    <td style={td}><span style={{ ...badge, background: '#eff6ff', color: '#2563eb' }}>{t.service_type}</span></td>
                                    <td style={{ ...td, fontWeight: 700, color: '#10b981' }}>₹{Number(t.amount).toLocaleString('en-IN')}</td>
                                    <td style={td}>{t.payment_mode}</td>
                                    <td style={td}><span style={{ ...badge, background: t.payment_status === 'Paid' ? '#dcfce7' : '#fef3c7', color: t.payment_status === 'Paid' ? '#166534' : '#92400e' }}>{t.payment_status}</span></td>
                                    <td style={td}>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const loadingStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontSize: '1.2rem', color: '#64748b' };
const pageTitle: React.CSSProperties = { fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' };
const pageSubtitle: React.CSSProperties = { color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' };
const card: React.CSSProperties = { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' };
const secTitle: React.CSSProperties = { fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginTop: 0, marginBottom: '16px' };
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const thead: React.CSSProperties = { backgroundColor: '#f8fafc' };
const th: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td: React.CSSProperties = { padding: '12px 16px', fontSize: '0.88rem', color: '#334155', borderTop: '1px solid #f1f5f9' };
const badge: React.CSSProperties = { padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 };
