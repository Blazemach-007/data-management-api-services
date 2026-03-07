'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getToken, logout } from '@/services/authService';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState<string>('staff');

    useEffect(() => {
        const token = getToken();
        if (!token) { router.push('/login'); return; }
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setRole(user.role);
                if (user.role === 'admin') router.push('/admin/dashboard');
            } catch { logout(); router.push('/login'); }
        }
    }, [router]);

    const handleLogout = () => { logout(); router.push('/login'); };
    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    const navItems = [
        { name: 'Customers', path: '/customers', icon: '👥', roles: ['staff', 'manager', 'admin'] },
        { name: 'Fastag', path: '/services/fastag', icon: '🚗', roles: ['staff', 'manager', 'admin'] },
        { name: 'PAN Card', path: '/services/pancard', icon: '🪪', roles: ['staff', 'manager', 'admin'] },
        { name: 'DSC', path: '/services/dsc', icon: '🔐', roles: ['staff', 'manager', 'admin'] },
        { name: 'Insurance', path: '/services/insurance', icon: '🛡️', roles: ['staff', 'manager', 'admin'] },
        { name: 'Aadhaar', path: '/services/aadhaar', icon: '📋', roles: ['staff', 'manager', 'admin'] },
        { name: 'Other', path: '/services/other', icon: '📦', roles: ['staff', 'manager', 'admin'] },
        { name: 'Expiry', path: '/expiry-tracker', icon: '⏰', roles: ['staff', 'manager', 'admin'] },
        { name: 'Billing', path: '/billing', icon: '🧾', roles: ['staff', 'manager', 'admin'] },
        { name: 'Reports', path: '/reports', icon: '📈', roles: ['manager', 'admin'] },
        { name: 'Inventory', path: '/inventory', icon: '📦', roles: ['manager', 'admin'] },
    ];

    const visibleItems = navItems.filter(item => item.roles.includes(role));

    return (
        <div style={s.layout}>
            <nav style={s.navbar}>
                <div style={s.navContainer}>
                    <div style={s.logo}>
                        <span style={s.logoText}>CareAll Digital Services</span>
                        <span style={{ ...s.roleBadge, backgroundColor: role === 'manager' ? '#7c3aed' : '#2563eb' }}>
                            {role.toUpperCase()}
                        </span>
                    </div>
                    <div style={s.links}>
                        {visibleItems.map(item => (
                            <Link key={item.path} href={item.path} style={{
                                ...s.link,
                                ...(isActive(item.path) ? s.activeLink : {})
                            }}>
                                {item.icon} {item.name}
                            </Link>
                        ))}
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
    navContainer: { maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' },
    logo: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
    logoText: { color: '#f59e0b', fontSize: '1rem', fontWeight: '800', whiteSpace: 'nowrap' },
    roleBadge: { color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' },
    links: { display: 'flex', gap: '2px', alignItems: 'center', overflowX: 'auto', flexWrap: 'nowrap' },
    link: { color: '#94a3b8', textDecoration: 'none', fontWeight: '500', fontSize: '0.8rem', padding: '5px 7px', borderRadius: '5px', whiteSpace: 'nowrap', transition: 'all 0.2s' },
    activeLink: { color: '#fff', backgroundColor: '#f59e0b20', borderBottom: '2px solid #f59e0b' },
    logoutBtn: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '8px', flexShrink: 0, fontSize: '0.8rem' },
    content: { padding: '0' }
};
