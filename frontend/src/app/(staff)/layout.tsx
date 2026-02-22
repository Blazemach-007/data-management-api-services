'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getToken, logout } from '@/services/authService';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navItems = [
        { name: 'Customer Management', path: '/customers' },
        { name: 'Transaction', path: '/transactions' }
        
    ];

    return (
        <div style={styles.layout}>
            {/* TOP NAVIGATION BAR */}
            <nav style={styles.navbar}>
                <div style={styles.navContainer}>
                    <div style={styles.logoSection}>
                        <span style={styles.logoText}>🚀 Staff Portal</span>
                    </div>
                    
                    <div style={styles.linksSection}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
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

            {/* PAGE CONTENT */}
            <div style={styles.pageContent}>
                {children}
            </div>
        </div>
    );
}

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    layout: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
    navbar: { 
        backgroundColor: '#2563eb', // Blue theme for Staff
        padding: '0 20px', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50 
    },
    navContainer: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' },
    logoSection: { display: 'flex', alignItems: 'center' },
    logoText: { color: '#ffffff', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.5px' },
    linksSection: { display: 'flex', gap: '20px', alignItems: 'center' },
    navLink: { 
        color: '#bfdbfe', // Light blue unselected
        textDecoration: 'none', 
        fontWeight: '600', 
        fontSize: '0.95rem', 
        padding: '8px 12px', 
        borderRadius: '6px', 
        transition: 'all 0.2s' 
    },
    activeLink: { color: '#2563eb', backgroundColor: '#ffffff' }, // White background when active
    logoutBtn: { 
        backgroundColor: '#1d4ed8', // Darker blue for logout
        color: 'white', 
        border: 'none', 
        padding: '8px 16px', 
        borderRadius: '6px', 
        fontWeight: 'bold', 
        cursor: 'pointer', 
        marginLeft: '10px', 
        transition: 'background-color 0.2s' 
    },
    pageContent: { padding: '0' } 
};