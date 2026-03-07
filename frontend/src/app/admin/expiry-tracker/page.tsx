'use client';
import { useEffect, useState } from 'react';
import { getExpiringItems, updateFollowup } from '@/services/serviceApi';

type FollowupStatus = 'Not Required' | 'Pending' | 'Contacted' | 'Renewed' | 'Closed';

function getDaysUntil(dateStr: string) {
    const today = new Date(); today.setHours(0,0,0,0);
    const exp = new Date(dateStr); exp.setHours(0,0,0,0);
    return Math.ceil((exp.getTime() - today.getTime()) / 86400000);
}

function ExpiryBadge({ days }: { days: number }) {
    const style: React.CSSProperties = {
        padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap'
    };
    if (days < 0)  return <span style={{ ...style, background: '#fee2e2', color: '#991b1b' }}>🔴 Expired ({Math.abs(days)}d ago)</span>;
    if (days <= 30) return <span style={{ ...style, background: '#ffedd5', color: '#9a3412' }}>🟠 {days}d left</span>;
    if (days <= 60) return <span style={{ ...style, background: '#fef9c3', color: '#854d0e' }}>🟡 {days}d left</span>;
    return <span style={{ ...style, background: '#dcfce7', color: '#166534' }}>🟢 {days}d left</span>;
}

export default function ExpiryTracker() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'expired' | 'soon'>('all');
    const [saving, setSaving] = useState<string>('');

    const load = () => {
        setLoading(true);
        getExpiringItems(90).then(setData).catch(console.error).finally(() => setLoading(false));
    };
    useEffect(load, []);

    const allItems = data ? [
        ...(data.expired?.dsc || []).map((r: any) => ({ ...r, _type: 'dsc', _cat: 'expired' })),
        ...(data.expired?.insurance || []).map((r: any) => ({ ...r, _type: 'insurance', _cat: 'expired' })),
        ...(data.expiring_soon?.dsc || []).map((r: any) => ({ ...r, _type: 'dsc', _cat: 'soon' })),
        ...(data.expiring_soon?.insurance || []).map((r: any) => ({ ...r, _type: 'insurance', _cat: 'soon' })),
    ] : [];

    const filtered = filter === 'all' ? allItems
        : filter === 'expired' ? allItems.filter(x => x._cat === 'expired')
        : allItems.filter(x => x._cat === 'soon');

    const handleUpdateStatus = async (item: any, status: FollowupStatus) => {
        setSaving(item.id);
        try {
            await updateFollowup(item._type, item.id, { follow_up_status: status, last_contact_date: new Date().toISOString().split('T')[0] });
            load();
        } catch (e) { console.error(e); }
        setSaving('');
    };

    return (
        <div>
            <h1 style={pageTitle}>⏰ Expiry Tracker</h1>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Track DSC and Insurance policies expiring soon or already expired.</p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {(['all', 'expired', 'soon'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ ...filterBtn, ...(filter === f ? filterActive : {}) }}>
                        {f === 'all' ? `All (${allItems.length})` : f === 'expired' ? `🔴 Expired (${allItems.filter(x => x._cat === 'expired').length})` : `⚠️ Expiring Soon (${allItems.filter(x => x._cat === 'soon').length})`}
                    </button>
                ))}
            </div>

            {loading ? <div style={loadingStyle}>Loading...</div> : (
                <div style={card}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tbl}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                    {['Customer', 'Phone', 'Service Type', 'Details', 'Expiry Date', 'Days', 'Follow-up Status', 'Action'].map(h => (
                                        <th key={h} style={th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>✅ No items to show</td></tr>
                                ) : filtered.map((item, i) => {
                                    const days = getDaysUntil(item.expiry_date);
                                    return (
                                        <tr key={item.id} style={i % 2 === 0 ? {} : { backgroundColor: '#f8fafc' }}>
                                            <td style={{ ...td, fontWeight: 600 }}>{item.Customer?.full_name || '—'}</td>
                                            <td style={td}>{item.Customer?.phone_number || '—'}</td>
                                            <td style={td}>
                                                <span style={{ ...badge, background: item._type === 'dsc' ? '#eff6ff' : '#fdf4ff', color: item._type === 'dsc' ? '#1d4ed8' : '#7e22ce' }}>
                                                    {item._type === 'dsc' ? '🔐 DSC' : '🛡️ Insurance'}
                                                </span>
                                            </td>
                                            <td style={{ ...td, fontSize: '0.8rem' }}>
                                                {item._type === 'dsc' ? `${item.cert_class} • ${item.authority || ''}` : `${item.policy_type} • ${item.insurance_provider || ''}`}
                                            </td>
                                            <td style={td}>{new Date(item.expiry_date).toLocaleDateString('en-IN')}</td>
                                            <td style={td}><ExpiryBadge days={days} /></td>
                                            <td style={td}>
                                                <span style={{ ...badge, background: item.follow_up_status === 'Renewed' ? '#dcfce7' : item.follow_up_status === 'Pending' ? '#fef3c7' : '#f1f5f9', color: item.follow_up_status === 'Renewed' ? '#166534' : item.follow_up_status === 'Pending' ? '#92400e' : '#475569' }}>
                                                    {item.follow_up_status}
                                                </span>
                                            </td>
                                            <td style={td}>
                                                <select value={item.follow_up_status} disabled={saving === item.id}
                                                    onChange={e => handleUpdateStatus(item, e.target.value as FollowupStatus)}
                                                    style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                    {['Pending','Contacted','Renewed','Not Interested','Closed'].map(s => <option key={s}>{s}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

const loadingStyle: React.CSSProperties = { textAlign: 'center', padding: '60px', color: '#64748b' };
const pageTitle: React.CSSProperties = { fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' };
const card: React.CSSProperties = { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' };
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', minWidth: '900px' };
const th: React.CSSProperties = { padding: '11px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td: React.CSSProperties = { padding: '11px 14px', fontSize: '0.875rem', color: '#334155', borderTop: '1px solid #f1f5f9' };
const badge: React.CSSProperties = { padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 };
const filterBtn: React.CSSProperties = { padding: '8px 18px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#475569', transition: 'all 0.15s' };
const filterActive: React.CSSProperties = { background: '#1e3a5f', color: '#fff', borderColor: '#1e3a5f' };
