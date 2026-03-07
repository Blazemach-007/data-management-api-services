'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getToken, logout } from '@/services/authService';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const token = getToken();
        if (!token) { router.push('/login'); return; }
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role !== 'admin') router.push('/login');
            } catch { logout(); router.push('/login'); }
        } else { logout(); router.push('/login'); }
    }, [router]);

    const handleLogout = () => { logout(); router.push('/login'); };

    const navGroups = [
        {
            items: [
                { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
                { name: 'Customers', path: '/admin/customers', icon: '👥' },
                { name: 'Transactions', path: '/admin/transactions', icon: '💳' },
            ]
        },
        {
            label: 'Services',
            items: [
                { name: 'Fastag', path: '/admin/services/fastag', icon: '🚗' },
                { name: 'PAN Card', path: '/admin/services/pancard', icon: '🪪' },
                { name: 'DSC', path: '/admin/services/dsc', icon: '🔐' },
                { name: 'Insurance', path: '/admin/services/insurance', icon: '🛡️' },
                { name: 'Aadhaar', path: '/admin/services/aadhaar', icon: '📋' },
                { name: 'Other', path: '/admin/services/other', icon: '📦' },
            ]
        },
        {
            items: [
                { name: 'Expiry Tracker', path: '/admin/expiry-tracker', icon: '⏰' },
                { name: 'Billing', path: '/admin/billing', icon: '🧾' },
                { name: 'Reports', path: '/admin/reports', icon: '📈' },
                { name: 'Inventory', path: '/admin/inventory', icon: '📦' },
                { name: 'Employees', path: '/admin/employees', icon: '👤' },
            ]
        }
    ];

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    return (
        <div style={s.layout}>
            <nav style={s.navbar}>
                <div style={s.navContainer}>
                    <div style={s.logo}>
                        <span style={s.logoIcon}>⚡</span>
                        <span style={s.logoText}>CareAll Admin</span>
                    </div>
                    <div style={s.links}>
                        {navGroups.map((group, gi) =>
                            group.items.map(item => (
                                <Link key={item.path} href={item.path} style={{
                                    ...s.link,
                                    ...(isActive(item.path) ? s.activeLink : {})
                                }}>
                                    {item.icon} {item.name}
                                </Link>
                            ))
                        )}
                        <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
                    </div>
                </div>
            </nav>
            <div style={s.content}>{children}</div>
        </div>
    );
}

const s: { [k: string]: React.CSSProperties } = {
    layout: { minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' },
    navbar: { backgroundColor: '#1e3a5f', padding: '0 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', position: 'sticky', top: 0, zIndex: 50 },
    navContainer: { maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px', overflowX: 'auto' },
    logo: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
    logoIcon: { fontSize: '1.4rem' },
    logoText: { color: '#f59e0b', fontSize: '1.1rem', fontWeight: '800', whiteSpace: 'nowrap' },
    links: { display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'nowrap', overflowX: 'auto' },
    link: { color: '#94a3b8', textDecoration: 'none', fontWeight: '500', fontSize: '0.82rem', padding: '6px 8px', borderRadius: '6px', whiteSpace: 'nowrap', transition: 'all 0.2s' },
    activeLink: { color: '#fff', backgroundColor: '#f59e0b20', borderBottom: '2px solid #f59e0b' },
    logoutBtn: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '8px', flexShrink: 0, fontSize: '0.82rem' },
    content: { padding: '0' }
};
