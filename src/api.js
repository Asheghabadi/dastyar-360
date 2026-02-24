const API_BASE_URL = 'http://localhost:8081';

// A simple wrapper for fetch to handle JSON and errors
const apiRequest = async (endpoint, method = 'GET', body = null, headers = {}) => {
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (body) {
        config.body = body;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
            throw new Error(errorData.detail || errorData.message);
        }

        if (response.status === 204 || response.status === 202) { // No Content or Accepted
            return;
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error calling ${method} ${endpoint}:`, error);
        throw error;
    }
};

// --- API Client Functions ---

export const login = async (email, password) => {
    const body = new URLSearchParams();
    body.append('username', email);
    body.append('password', password);

    const token = await apiRequest('/token', 'POST', body, { 'Content-Type': 'application/x-www-form-urlencoded' });
    return token;
};

export const register = (userData) => {
    return apiRequest('/users/register', 'POST', JSON.stringify(userData));
};

export const getCurrentUser = (token) => {
    return apiRequest('/users/me', 'GET', null, { 'Authorization': `Bearer ${token}` });
};

export const createEnterprise = (enterpriseData) => {
    return apiRequest('/enterprises/', 'POST', JSON.stringify(enterpriseData));
};

export const getMyEnterprise = (token) => {
    return apiRequest('/enterprises/my', 'GET', null, { 'Authorization': `Bearer ${token}` });
};

export const updateMyEnterprise = (enterpriseData, token) => {
    return apiRequest('/enterprises/my', 'PUT', JSON.stringify(enterpriseData), { 'Authorization': `Bearer ${token}` });
};

export const getFinancialAlerts = (token) => {
    return apiRequest(`/enterprises/my/financial-alerts/`, 'GET', null, { 'Authorization': `Bearer ${token}` });
};

export const getBrandAlerts = (token) => {
    return apiRequest(`/enterprises/my/brand-alerts/`, 'GET', null, { 'Authorization': `Bearer ${token}` });
};

export const getGanttTasks = (token) => {
    return apiRequest(`/enterprises/my/gantt-chart/`, 'GET', null, { 'Authorization': `Bearer ${token}` });
};

export const triggerBrandCrawler = (token) => {
    return apiRequest('/watchdog/run-brand-crawler/', 'POST', null, { 'Authorization': `Bearer ${token}` });
};

export const triggerGazetteCrawler = (token) => {
    return apiRequest('/watchdog/run-gazette-crawler/', 'POST', null, { 'Authorization': `Bearer ${token}` });
};

export const addBankTransaction = (transactionData, token) => {
    return apiRequest('/enterprises/my/transactions/', 'POST', JSON.stringify(transactionData), { 'Authorization': `Bearer ${token}` });
};

export const addTaxInvoice = (invoiceData, token) => {
    return apiRequest('/enterprises/my/invoices/', 'POST', JSON.stringify(invoiceData), { 'Authorization': `Bearer ${token}` });
};

export const getBankTransactions = (token) => {
    return apiRequest('/enterprises/my/transactions/', 'GET', null, { 'Authorization': `Bearer ${token}` });
};

export const getTaxInvoices = (token) => {
    return apiRequest('/enterprises/my/invoices/', 'GET', null, { 'Authorization': `Bearer ${token}` });
};



export const getGazetteAnnouncements = (token) => {
    return apiRequest('/watchdog/gazette-announcements/', 'GET', null, { 'Authorization': `Bearer ${token}` });
};

export const getTrademarkRegistrations = (token) => {
    return apiRequest('/watchdog/trademark-registrations/', 'GET', null, { 'Authorization': `Bearer ${token}` });
};

export const runGazetteCrawler = (token) => {
    return apiRequest('/watchdog/run-gazette-crawler/', 'POST', null, { 'Authorization': `Bearer ${token}` });
};

export const runBrandCrawler = (token) => {
    return apiRequest('/watchdog/run-brand-crawler/', 'POST', null, { 'Authorization': `Bearer ${token}` });
};

export const getCrawlerStatus = (token) => {
    return apiRequest('/watchdog/status/', 'GET', null, { 'Authorization': `Bearer ${token}` });
};





export const deleteBankTransaction = (transactionId, token) => {
    return apiRequest(`/enterprises/my/transactions/${transactionId}`, 'DELETE', null, { 'Authorization': `Bearer ${token}` });
};

export const deleteTaxInvoice = (invoiceId, token) => {
    return apiRequest(`/enterprises/my/invoices/${invoiceId}`, 'DELETE', null, { 'Authorization': `Bearer ${token}` });
};

export const updateBankTransaction = (transactionId, transactionData, token) => {
    return apiRequest(`/enterprises/my/transactions/${transactionId}`, 'PUT', transactionData, { 'Authorization': `Bearer ${token}` });
};

export const updateTaxInvoice = (invoiceId, invoiceData, token) => {
    return apiRequest(`/enterprises/my/invoices/${invoiceId}`, 'PUT', invoiceData, { 'Authorization': `Bearer ${token}` });
};
