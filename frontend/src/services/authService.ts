const API_URL = 'http://localhost:5000/api/auth';

export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');
    
    // Store token and user details
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', json.token);
        localStorage.setItem('user', JSON.stringify(json.user));
    }
    
    return json;
};

export const changePassword = async (email: string, old_password: string, new_password: string) => {
    const res = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, old_password, new_password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Password change failed');
    return json;
};