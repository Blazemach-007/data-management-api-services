import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api/transactions';

// Define the payload types for type safety
export interface BaseTransaction {
    customer_id: string;
    // employee_id is now handled by the backend via token
    amount_paid: number;
}

export interface FastagData extends BaseTransaction {
    vehicle_number: string;
    vehicle_type: string;
}

export interface InsuranceData extends BaseTransaction {
    policy_number: string;
    insurance_provider: string;
    policy_type: string;
    expiry_date: string;
}

export interface AadhaarData extends BaseTransaction {
    aadhaar_number: string;
    service_type: string;
}

export interface OtherData extends BaseTransaction {
    service_name: string;
    description: string;
}

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// Generic function to send data
const sendTransaction = async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Transaction failed');
    return json;
};

export const api = {
    fastag: (data: FastagData) => sendTransaction('fastag', data),
    insurance: (data: InsuranceData) => sendTransaction('insurance', data),
    aadhaar: (data: AadhaarData) => sendTransaction('aadhaar', data),
    other: (data: OtherData) => sendTransaction('other', data),
};

export const getTransactions = async () => {
    const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
};