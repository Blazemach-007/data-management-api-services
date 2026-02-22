'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login, changePassword } from '@/services/authService';

type ViewState = 'login' | 'change_password';

export default function LoginPage() {
    const router = useRouter();
    const [serverStatus, setServerStatus] = useState("Checking Server...");
    
    // View Toggle
    const [view, setView] = useState<ViewState>('login');
    
    // Form State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:5000/api/health')
            .then((res) => res.json())
            .then(() => setServerStatus("Online"))
            .catch(() => setServerStatus("Offline"));
    }, []);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const result = await login(email, password);
            setMessage({ text: '✅ Login successful! Redirecting...', type: 'success' });
            
            // ROLE-BASED ROUTING
            setTimeout(() => {
                if (result.user.role === 'admin') {
                    router.push('/admin/transactions'); // Admins go to dashboard
                } else {
                    router.push('/customers'); // Staff go to data entry
                }
            }, 1000);

        } catch (error: any) {
            setMessage({ text: `⚠️ ${error.message}`, type: 'error' });
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ text: "⚠️ New passwords do not match.", type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            await changePassword(email, oldPassword, newPassword);
            
            setMessage({ text: '✅ Password changed! Please log in with your new password.', type: 'success' });
            
            // Clear passwords and switch back to login view
            setPassword('');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            setTimeout(() => {
                setView('login');
                setMessage({ text: '', type: '' }); // Clear message after switching
            }, 2500);

        } catch (error: any) {
            setMessage({ text: `⚠️ ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={styles.pageContainer}>
            <div style={styles.card}>
                
                <div style={styles.header}>
                    <h1 style={styles.title}>Fastag Tracker</h1>
                    <div style={{
                        ...styles.statusBadge, 
                        ...(serverStatus === 'Online' ? styles.statusOnline : styles.statusOffline)
                    }}>
                        Server: {serverStatus}
                    </div>
                </div>

                {/* Alert Message */}
                {message.text && (
                    <div style={{
                        ...styles.alert,
                        ...(message.type === 'success' ? styles.alertSuccess : styles.alertError)
                    }}>
                        {message.text}
                    </div>
                )}

                {/* --- LOGIN VIEW --- */}
                {view === 'login' && (
                    <form onSubmit={handleLogin} style={styles.form}>
                        <h2 style={styles.subtitle}>Sign In to Your Account</h2>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input 
                                type="email" 
                                required 
                                style={styles.input} 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <input 
                                type="password" 
                                required 
                                style={styles.input} 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? 'Authenticating...' : 'Secure Login'}
                        </button>

                        <div style={styles.footerText}>
                            Need to update your credentials?{' '}
                            <span style={styles.link} onClick={() => { setView('change_password'); setMessage({text:'', type:''}); }}>
                                Change Password
                            </span>
                        </div>
                    </form>
                )}

                {/* --- CHANGE PASSWORD VIEW --- */}
                {view === 'change_password' && (
                    <form onSubmit={handleChangePassword} style={styles.form}>
                        <h2 style={styles.subtitle}>Change Your Password</h2>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input 
                                type="email" 
                                required 
                                style={styles.input} 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Current Password</label>
                            <input 
                                type="password" 
                                required 
                                style={styles.input} 
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>New Password</label>
                            <input 
                                type="password" 
                                required 
                                style={styles.input} 
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Confirm New Password</label>
                            <input 
                                type="password" 
                                required 
                                style={styles.input} 
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>

                        <div style={styles.footerText}>
                            Remembered your password?{' '}
                            <span style={styles.link} onClick={() => { setView('login'); setMessage({text:'', type:''}); }}>
                                Back to Login
                            </span>
                        </div>
                    </form>
                )}

            </div>
        </main>
    );
}

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '450px',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px'
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: '800',
        color: '#1e293b',
        margin: '0 0 10px 0'
    },
    subtitle: {
        fontSize: '1.2rem',
        color: '#334155',
        marginBottom: '25px',
        textAlign: 'center',
        fontWeight: '600'
    },
    statusBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    statusOnline: {
        backgroundColor: '#dcfce7',
        color: '#166534',
    },
    statusOffline: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#475569'
    },
    input: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '1rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '14px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: '#2563eb',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.2s'
    },
    footerText: {
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#64748b',
        marginTop: '10px'
    },
    link: {
        color: '#2563eb',
        fontWeight: 'bold',
        cursor: 'pointer',
        textDecoration: 'underline'
    },
    alert: {
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '0.9rem'
    },
    alertSuccess: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        border: '1px solid #bbf7d0'
    },
    alertError: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fecaca'
    }
};
