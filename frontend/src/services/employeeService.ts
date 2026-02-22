import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api/employees';

export interface EmployeeData {
    id?: string;
    email: string;       // <--- Changed from username
    full_name: string;
    role: 'admin' | 'staff';
    password?: string;
}

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

export const getEmployees = async () => {
    const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
};

export const createEmployee = async (data: EmployeeData) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error creating user');
    return json;
};

export const deleteEmployee = async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Error deleting user');
    return res.json();
};