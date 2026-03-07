'use client';
import { useState, useEffect } from 'react';
import { getReportSummary, getReportMonthly, getReportDaily } from '@/services/serviceApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#1e3a5f', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportsPage() {
    const [summary, setSummary] = useState<any>(null);
    const [monthly, setMonthly] = useState<any[]>([]);
    const [daily, setDaily] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    const load = () => {
        setLoading(true);
        Promise.all([
            getReportSummary(),
            getReportMonthly(year, month),
            getReportDaily(30)
        ]).then(([s, m, d]) => {
            setSummary(s);
            setMonthly(Array.isArray(m) ? m : []);
            setDaily(Array.isArray(d) ? d : []);
        }).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [year, month]);

    const statCards = summary ? [
        { label: 'Total Customers', value: summary.totalCustomers || 0, color: '#1e3a5f', icon: '👥' },
        { label: 'Total Transactions', value: summary.totalTransactions || 0, color: '#2563eb', icon: '💳' },
        { label: 'Total Revenue', value: `₹${(summary.totalRevenue || 0).toLocaleString()}`, color: '#16a34a', icon: '💰' },
        { label: "Today's Revenue", value: `₹${(summary.todayRevenue || 0).toLocaleString()}`, color: '#d97706', icon: '📅' },
        { label: "Today's Transactions", value: summary.todayTransactions || 0, color: '#7c3aed', icon: '📊' },
    ] : [];

    if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading reports...</div>;

    return (
        <div style={pg.wrap}>
            <div style={pg.header}>
                <div><h1 style={pg.title}>📈 Reports & Analytics</h1><p style={pg.sub}>Business performance overview</p></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} style={pg.select}>
                        {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
                    </select>
                    <select value={month} onChange={e => setMonth(Number(e.target.value))} style={pg.select}>
                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={pg.statGrid}>
                {statCards.map(s => (
                    <div key={s.label} style={pg.statCard}>
                        <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Monthly by Service Type */}
            {monthly.length > 0 && (
                <div style={pg.chartCard}>
                    <h2 style={pg.chartTitle}>Monthly Revenue by Service — {year}/{month}</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthly} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                            <XAxis dataKey="service_type" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                            <Bar dataKey="total_revenue" name="Revenue" radius={[6,6,0,0]}>
                                {monthly.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Daily trend */}
            {daily.length > 0 && (
                <div style={pg.chartCard}>
                    <h2 style={pg.chartTitle}>Daily Revenue — Last 30 Days</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={daily} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                            <Line type="monotone" dataKey="total_revenue" name="Revenue" stroke="#1e3a5f" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Service Distribution */}
            {monthly.length > 0 && (
                <div style={pg.chartCard}>
                    <h2 style={pg.chartTitle}>Service Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={monthly} dataKey="total_count" nameKey="service_type" cx="50%" cy="50%" outerRadius={100} label={({ service_type, total_count }: any) => `${service_type}: ${total_count}`}>
                                {monthly.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

const pg: any = {
    wrap: { padding: 24, maxWidth: 1200, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
    title: { fontSize: '1.5rem', fontWeight: 800, color: '#1e3a5f', margin: 0 },
    sub: { color: '#64748b', margin: '4px 0 0', fontSize: '0.9rem' },
    select: { padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 },
    statCard: { backgroundColor: '#fff', borderRadius: 10, padding: '16px 12px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' },
    chartCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    chartTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }
};
