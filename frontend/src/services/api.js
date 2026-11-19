const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeader() {
    const token = localStorage.getItem('pastil_auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeader(),
        ...(options.headers || {}),
    };

    const config = {
        ...options,
        headers,
    };

    if (config.body && typeof config.body !== 'string' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
            const err = new Error(errorMsg);
            err.status = response.status;
            err.data = data;
            throw err;
        }

        return data;
    } catch (err) {
        console.error(`API Error [${endpoint}]:`, err);
        throw err;
    }
}

// Authentication
export const authApi = {
    login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
    me: () => apiRequest('/auth/me'),
    logout: () => apiRequest('/auth/logout', { method: 'POST' }),
    updateProfile: (details) => apiRequest('/auth/profile', { method: 'PATCH', body: details }),
    changePassword: (details) => apiRequest('/auth/password', { method: 'PUT', body: details }),
};

// Products
export const productsApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/products${query ? `?${query}` : ''}`);
    },
    getOne: (id) => apiRequest(`/products/${id}`),
    create: (data) => apiRequest('/products', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/products/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
};

// Categories
export const categoriesApi = {
    getAll: () => apiRequest('/categories'),
    create: (data) => apiRequest('/categories', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/categories/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
};

// Suppliers
export const suppliersApi = {
    getAll: () => apiRequest('/suppliers'),
    create: (data) => apiRequest('/suppliers', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/suppliers/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/suppliers/${id}`, { method: 'DELETE' }),
};

// Orders
export const ordersApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/orders${query ? `?${query}` : ''}`);
    },
    getOne: (id) => apiRequest(`/orders/${id}`),
    create: (data) => apiRequest('/orders', { method: 'POST', body: data }),
    updateStatus: (id, statusData) => apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: statusData }),
};

// Inventory
export const inventoryApi = {
    getLogs: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/inventory/logs${query ? `?${query}` : ''}`);
    },
    getLowStock: () => apiRequest('/inventory/low-stock'),
    restock: (data) => apiRequest('/inventory/restock', { method: 'POST', body: data }),
};

// Reports
export const reportsApi = {
    getSales: () => apiRequest('/reports/sales'),
    getLowStock: () => apiRequest('/reports/low-stock'),
    getProductPerformance: () => apiRequest('/reports/product-performance'),
    getCustomers: () => apiRequest('/reports/customers'),
};

// Reviews
export const reviewsApi = {
    getAll: () => apiRequest('/reviews'),
    create: (data) => apiRequest('/reviews', { method: 'POST', body: data }),
};

// Database Tools
export const dbToolsApi = {
    getSchema: () => apiRequest('/db/schema'),
    getOptimization: (example = 1) => apiRequest(`/db/optimization?example=${example}`),
    runTransactionDemo: (action = 'commit') => apiRequest('/db/transaction-demo', { method: 'POST', body: { action } }),
};
