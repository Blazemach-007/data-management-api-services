'use client';
import { useState, useEffect } from 'react';
import { getExpiringItems, updateFollowup } from '@/services/serviceApi';

export default function ExpiryTrackerPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(90);
    const [filter, setFilter] = useState('all');
    const [msg, setMsg] = useState('');

    const load = () => {
        setLoading(true);
        getExpiringItems(days).then(setItems).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [days]);

    const handleFollowup = async (type: string, id: string, status: string) => {
        try {
            await updateFollowup(type.toLowerCase(), id, { follow_up_status: status });
            setMsg('✅ Follow-up updated');
            load();
        } catch (err: any) { setMsg('❌ ' + err.message); }
    };

    const daysLeft = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

    const urgencyColor = (d: string) => {
        const n = daysLeft(d);
        if (n < 0) return { bg: '#fee2e2', color: '#dc2626', label: 'EXPIRED' };
        if (n <= 7) return { bg: '#fee2e2', color: '#dc2626', label: `${n}d left` };
        if (n <= 30) return { bg: '#fff7ed', color: '#d97706', label: `${n}d left` };
        return { bg: '#f0fdf4', color: '#16a34a', label: `${n}d left` };
    };

    const filtered = items.filter(i => {
        if (filter === 'expired') return daysLeft(i.expiry_date) < 0;
        if (filter === 'urgent') return daysLeft(i.expiry_date) >= 0 && daysLeft(i.expiry_date) <= 30;
        return true;
    });

    const stats = {
        expired: items.filter(i => daysLeft(i.expiry_date) < 0).length,
        urgent: items.filter(i => daysLeft(i.expiry_date) >= 0 && daysLeft(i.expiry_date) <= 30).length,
        upcoming: items.filter(i => daysLeft(i.expiry_date) > 30).length,
    };

    return (
        <div style={pg.wrap}>
            <div style={pg.header}>
                <div>
                    <h1 style={pg.title}>⏰ Expiry Tracker</h1>
                    <p style={pg.sub}>DSC & Insurance renewals follow-up</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Show next:</label>
                    <select value={days} onChange={e => setDays(Number(e.target.value))} style={pg.select}>
                        {[30, 60, 90, 180, 365].map(d => <option key={d} value={d}>{d} days</option>)}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div style={pg.statRow}>
                {[
                    { label: 'Expired', value: stats.expired, color: '#dc2626', bg: '#fee2e2', filter: 'expired' },
                    { label: 'Urgent (≤30d)', value: stats.urgent, color: '#d97706', bg: '#fff7ed', filter: 'urgent' },
                    { label: 'Upcoming', value: stats.upcoming, color: '#16a34a', bg: '#dcfce7', filter: 'upcoming' },
                    { label: 'Total', value: items.length, color: '#2563eb', bg: '#eff6ff', filter: 'all' },
                ].map(s => (
                    <button key={s.filter} onClick={() => setFilter(s.filter)} style={{ ...pg.statCard, backgroundColor: s.bg, border: filter === s.filter ? `2px solid ${s.color}` : '2px solid transparent' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{s.label}</div>
                    </button>
                ))}
            </div>

            {msg && <div style={{ ...pg.alert, backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b' }}>{msg}</div>}

            {loading ? <p style={pg.loading}>Loading...</p> : (
                <div style={pg.tableWrap}><table style={pg.table}>
                    <thead><tr style={pg.thead}>{['Customer', 'Phone', 'Type', 'Expiry Date', 'Days Left', 'Follow-up', 'Actions'].map(h => <th key={h} style={pg.th}>{h}</th>)}</tr></thead>
                    <tbody>
                        {filtered.length === 0 ? <tr><td colSpan={7} style={pg.empty}>No items in this range</td></tr>
                            : filtered.map(item => {
                                const urg = urgencyColor(item.expiry_date);
                                return (
                                    <tr key={`${item.service_type}-${item.id}`} style={pg.tr}>
                                        <td style={pg.td}><div style={pg.name}>{item.Customer?.full_name || '-'}</div></td>
                                        <td style={pg.td}>{item.Customer?.phone_number || '-'}</td>
                                        <td style={pg.td}><span style={{ ...pg.badge, backgroundColor: item.service_type === 'DSC' ? '#ede9fe' : '#dbeafe', color: item.service_type === 'DSC' ? '#7c3aed' : '#2563eb' }}>{item.service_type}</span></td>
                                        <td style={pg.td}>{item.expiry_date}</td>
                                        <td style={pg.td}><span style={{ ...pg.badge, backgroundColor: urg.bg, color: urg.color, fontWeight: 800 }}>{urg.label}</span></td>
                                        <td style={pg.td}><span style={{ ...pg.badge, backgroundColor: '#f1f5f9', color: '#64748b' }}>{item.follow_up_status}</span></td>
                                        <td style={pg.td}>
                                            <select defaultValue={item.follow_up_status} onChange={e => handleFollowup(item.service_type, item.id, e.target.value)} style={{ ...pg.select, width: 120 }}>
                                                {['None', 'Pending', 'Contacted', 'Done'].map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
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
    select: { padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.85rem' },
    statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 },
    statCard: { padding: '16px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' },
    alert: { padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600 },
    tableWrap: { overflowX: 'auto', backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#1e3a5f' },
    th: { padding: '12px 14px', textAlign: 'left', color: '#fff', fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '11px 14px', fontSize: '0.87rem', color: '#334155' },
    name: { fontWeight: 700, color: '#1e3a5f' },
    badge: { padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: '0.78rem' },
    loading: { textAlign: 'center', color: '#64748b', padding: 40 },
    empty: { textAlign: 'center', color: '#94a3b8', padding: 30 }
};
