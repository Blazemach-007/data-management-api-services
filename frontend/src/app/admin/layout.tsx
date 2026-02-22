'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getToken, logout } from '@/services/authService';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/login');
            return;
        }

        // Check if user is admin
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role !== 'admin') {
                    router.push('/login'); 
                }
            } catch (e) {
                // If JSON parse fails, data is corrupt. Logout.
                logout();
                router.push('/login');
            }
        } else {
             // Token exists but no user data? Weird. Logout.
             logout();
             router.push('/login');
        }
    }, [router]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navItems = [
        { name: 'Transactions', path: '/admin/transactions' },
        { name: 'Customers', path: '/admin/customers' },
        { name: 'Employees', path: '/admin/employees' },
    ];

    return (
        <div style={styles.layout}>
            {/* TOP NAVIGATION BAR */}
            <nav style={styles.navbar}>
                <div style={styles.navContainer}>
                    <div style={styles.logoSection}>
                        <span style={styles.logoText}>⚡ Admin Portal</span>
                    </div>
                    
                    <div style={styles.linksSection}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link 
                                    key={item.name} 
                                    href={item.path}
                                    style={{
                                        ...styles.navLink,
                                        ...(isActive ? styles.activeLink : {})
                                    }}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* PAGE CONTENT (This is where the individual pages load) */}
            <div style={styles.pageContent}>
                {children}
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    layout: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
    navbar: { backgroundColor: '#1e293b', padding: '0 20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 50 },
    navContainer: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' },
    logoSection: { display: 'flex', alignItems: 'center' },
    logoText: { color: '#ffffff', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.5px' },
    linksSection: { display: 'flex', gap: '20px', alignItems: 'center' },
    navLink: { color: '#94a3b8', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem', padding: '8px 12px', borderRadius: '6px', transition: 'all 0.2s' },
    activeLink: { color: '#ffffff', backgroundColor: '#334155' },
    logoutBtn: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '10px', transition: 'background-color 0.2s' },
    pageContent: { padding: '0' } // Child pages have their own padding
};