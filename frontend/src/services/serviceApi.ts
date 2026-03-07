const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

function getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function apiFetch(path: string, opts: RequestInit = {}) {
    const res = await fetch(`${API}${path}`, { ...opts, headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
}

// ─── Generic Service CRUD ────────────────────────────────────────────────────
export const fetchService  = (svc: string, params = '') => apiFetch(`/api/${svc}${params}`);
export const createService = (svc: string, body: any) =>
    apiFetch(`/api/${svc}`, { method: 'POST', body: JSON.stringify(body) });
export const updateService = (svc: string, id: string, body: any) =>
    apiFetch(`/api/${svc}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteService = (svc: string, id: string) =>
    apiFetch(`/api/${svc}/${id}`, { method: 'DELETE' });

// ─── Customers ───────────────────────────────────────────────────────────────
export const getCustomers   = (q = '') => apiFetch(`/api/customers${q ? `?search=${q}` : ''}`);
export const getCustomer    = (id: string) => apiFetch(`/api/customers/${id}`);
export const createCustomer = (body: any) => apiFetch('/api/customers', { method: 'POST', body: JSON.stringify(body) });
export const updateCustomer = (id: string, body: any) => apiFetch(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteCustomer = (id: string) => apiFetch(`/api/customers/${id}`, { method: 'DELETE' });

// ─── Employees ───────────────────────────────────────────────────────────────
export const getEmployees   = () => apiFetch('/api/employees');
export const createEmployee = (body: any) => apiFetch('/api/employees', { method: 'POST', body: JSON.stringify(body) });
export const updateEmployee = (id: string, body: any) => apiFetch(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteEmployee = (id: string) => apiFetch(`/api/employees/${id}`, { method: 'DELETE' });

// ─── Transactions ─────────────────────────────────────────────────────────────
export const getTransactions   = (params = '') => apiFetch(`/api/transactions${params}`);
export const createTransaction = (body: any) => apiFetch('/api/transactions', { method: 'POST', body: JSON.stringify(body) });

// ─── Service-specific ────────────────────────────────────────────────────────
export const getFastag   = () => apiFetch('/api/fastag');
export const createFastag = (body: any) => apiFetch('/api/fastag', { method: 'POST', body: JSON.stringify(body) });
export const updateFastag = (id: string, b: any) => apiFetch(`/api/fastag/${id}`, { method: 'PUT', body: JSON.stringify(b) });
export const deleteFastag = (id: string) => apiFetch(`/api/fastag/${id}`, { method: 'DELETE' });

export const getPancard   = () => apiFetch('/api/pancard');
export const createPancard = (body: any) => apiFetch('/api/pancard', { method: 'POST', body: JSON.stringify(body) });
export const updatePancard = (id: string, b: any) => apiFetch(`/api/pancard/${id}`, { method: 'PUT', body: JSON.stringify(b) });

export const getDSC   = () => apiFetch('/api/dsc');
export const createDSC = (body: any) => apiFetch('/api/dsc', { method: 'POST', body: JSON.stringify(body) });
export const updateDSC = (id: string, b: any) => apiFetch(`/api/dsc/${id}`, { method: 'PUT', body: JSON.stringify(b) });

export const getInsurance   = () => apiFetch('/api/insurance');
export const createInsurance = (body: any) => apiFetch('/api/insurance', { method: 'POST', body: JSON.stringify(body) });
export const updateInsurance = (id: string, b: any) => apiFetch(`/api/insurance/${id}`, { method: 'PUT', body: JSON.stringify(b) });

export const getAadhaar   = () => apiFetch('/api/aadhaar');
export const createAadhaar = (body: any) => apiFetch('/api/aadhaar', { method: 'POST', body: JSON.stringify(body) });
export const updateAadhaar = (id: string, b: any) => apiFetch(`/api/aadhaar/${id}`, { method: 'PUT', body: JSON.stringify(b) });

export const getOther   = () => apiFetch('/api/other');
export const createOther = (body: any) => apiFetch('/api/other', { method: 'POST', body: JSON.stringify(body) });
export const updateOther = (id: string, b: any) => apiFetch(`/api/other/${id}`, { method: 'PUT', body: JSON.stringify(b) });

// ─── Reports ─────────────────────────────────────────────────────────────────
export const getReportSummary = () => apiFetch('/api/reports/summary');
export const getReportMonthly = (year: number, month: number) =>
    apiFetch(`/api/reports/monthly?year=${year}&month=${month}`);
export const getReportDaily = (days = 30) => apiFetch(`/api/reports/daily?days=${days}`);

// ─── Inventory ───────────────────────────────────────────────────────────────
export const getInventory   = () => apiFetch('/api/inventory');
export const createInventory = (body: any) => apiFetch('/api/inventory', { method: 'POST', body: JSON.stringify(body) });
export const updateInventory = (id: string, b: any) => apiFetch(`/api/inventory/${id}`, { method: 'PUT', body: JSON.stringify(b) });
export const stockTransaction = (id: string, b: any) =>
    apiFetch(`/api/inventory/${id}/transaction`, { method: 'POST', body: JSON.stringify(b) });

// ─── Followups / Expiry ──────────────────────────────────────────────────────
export const getExpiringItems = (days = 90) => apiFetch(`/api/followups/expiring?days=${days}`);
export const updateFollowup   = (type: string, id: string, body: any) =>
    apiFetch(`/api/followups/${type}/${id}`, { method: 'PUT', body: JSON.stringify(body) });

// ─── Invoices ────────────────────────────────────────────────────────────────
export const generateInvoice = (transaction_id: string) =>
    apiFetch('/api/invoices/generate', { method: 'POST', body: JSON.stringify({ transaction_id }) });
