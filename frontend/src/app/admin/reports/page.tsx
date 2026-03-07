'use client';
import { useEffect, useState } from 'react';
import { getReportSummary, getReportMonthly, getReportDaily } from '@/services/serviceApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ReportsPage() {
    const now = new Date();
    const [summary, setSummary] = useState<any>(null);
    const [monthly, setMonthly] = useState<any[]>([]);
    const [daily, setDaily] = useState<any[]>([]);
    const [selMonth, setSelMonth] = useState(now.getMonth());
    const [selYear, setSelYear] = useState(now.getFullYear());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getReportSummary(),
            getReportMonthly(selYear, selMonth + 1),
            getReportDaily(30)
        ]).then(([s, m, d]) => { setSummary(s); setMonthly(m); setDaily(d); })
          .catch(console.error).finally(() => setLoading(false));
    }, [selMonth, selYear]);

    const exportCSV = () => {
        const rows = [['Service Type', 'Revenue (₹)', 'Count'], ...monthly.map(r => [r.service_type, r.revenue, r.count])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const a = document.createElement('a');
        a.href = 'data:text/csv,' + encodeURIComponent(csv);
        a.download = `careall-report-${MONTHS[selMonth]}-${selYear}.csv`;
        a.click();
    };

    if (loading) return <div style={loadingStyle}>Loading Reports...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: 12 }}>
                <h1 style={pageTitle}>📈 Reports & Analytics</h1>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))} style={sel}>
                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select value={selYear} onChange={e => setSelYear(Number(e.target.value))} style={sel}>
                        {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
                    </select>
                    <button onClick={exportCSV} style={exportBtn}>⬇️ Export CSV</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={grid4}>
                {[
                    { label: 'Total Customers', v: summary?.totalCustomers || 0, icon: '👥', c: '#3b82f6' },
                    { label: 'Total Transactions', v: summary?.totalTransactions || 0, icon: '📋', c: '#f59e0b' },
                    { label: "Today's Revenue", v: `₹${(summary?.todayRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', c: '#10b981' },
                    { label: 'Total Revenue', v: `₹${(summary?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '📈', c: '#8b5cf6' },
                ].map(c => (
                    <div key={c.label} style={{ ...card, borderTop: `4px solid ${c.c}`, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem' }}>{c.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.c }}>{c.v}</div>
                        <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>{c.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Bar Chart */}
                <div style={card}>
                    <h2 style={secTitle}>Revenue by Service — {MONTHS[selMonth]} {selYear}</h2>
                    {monthly.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No data for this period</div> : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthly}>
                                <XAxis dataKey="service_type" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                                <Bar dataKey="revenue" radius={[6,6,0,0]}>
                                    {monthly.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart */}
                <div style={card}>
                    <h2 style={secTitle}>Service Mix — {MONTHS[selMonth]} {selYear}</h2>
                    {monthly.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No data for this period</div> : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={monthly} dataKey="count" nameKey="service_type" cx="50%" cy="50%" outerRadius={90} label={({ service_type, percent }) => `${service_type} ${(percent * 100).toFixed(0)}%`}>
                                    {monthly.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Line Chart — last 30 days */}
            <div style={card}>
                <h2 style={secTitle}>Daily Revenue — Last 30 Days</h2>
                {daily.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No data</div> : (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={daily}>
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

const loadingStyle: React.CSSProperties = { textAlign: 'center', padding: '80px', color: '#64748b', fontSize: '1.1rem' };
const pageTitle: React.CSSProperties = { fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: 0 };
const card: React.CSSProperties = { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', marginBottom: '4px' };
const secTitle: React.CSSProperties = { fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginTop: 0, marginBottom: '16px' };
const grid4: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' };
const sel: React.CSSProperties = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', cursor: 'pointer' };
const exportBtn: React.CSSProperties = { padding: '8px 18px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' };
