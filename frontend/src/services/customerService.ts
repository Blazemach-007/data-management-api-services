import { getToken } from './authService';

// Define the interface here so it can be reused

export interface CustomerData {
    id?: string; // We need ID for keys
    full_name: string;
    phone_number: string;
    email: string;
    address: string;
    pincode: string;
    createdAt?: string; // We need this for date filtering
}

const API_URL = 'http://localhost:5000/api/customers';

const getHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getCustomers = async () => {
    const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
};

export const createCustomer = async (customerData: CustomerData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(customerData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error: any) {
        // We re-throw the error so the UI component can handle showing the message
        throw new Error(error.message || 'Failed to connect to server');
    }
};