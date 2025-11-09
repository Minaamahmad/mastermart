import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store function to set Auth0 token
let auth0TokenGetter = null;

export const setAuth0TokenGetter = (getter) => {
  auth0TokenGetter = getter;
};

// Add token to requests if available (supports both admin and Auth0 tokens)
api.interceptors.request.use(async (config) => {
  // Priority: Admin token first, then Auth0 token
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (auth0TokenGetter) {
    try {
      const token = await auth0TokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Silently fail if token cannot be retrieved
      console.error('Error getting Auth0 token:', error);
    }
  }
  return config;
});

// Handle 401 errors globally - token expired or invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('adminToken');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Products API
export const getProducts = (params = {}) => {
  return api.get('/products', { params });
};

export const getProduct = (id) => {
  return api.get(`/products/${id}`);
};

export const createProduct = (formData) => {
  return api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateProduct = (id, formData) => {
  return api.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};

// Orders API
export const createOrder = (orderData) => {
  return api.post('/orders', orderData);
};

export const getOrders = () => {
  return api.get('/orders');
};

export const getOrder = (id) => {
  return api.get(`/orders/${id}`);
};

export const updateOrderStatus = (id, status) => {
  return api.put(`/orders/${id}/status`, { status });
};

// Auth API
export const adminLogin = (credentials) => {
  return api.post('/auth/login', credentials);
};

export const adminRegister = (credentials) => {
  return api.post('/auth/register', credentials);
};

export const verifyToken = () => {
  return api.get('/auth/verify');
};

// User API (Auth0)
export const getUserProfile = () => {
  return api.get('/users/me');
};

export const updateUserProfile = (data) => {
  return api.put('/users/me', data);
};

export const syncUser = async (token) => {
  return api.post('/users/sync', {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getUserOrders = () => {
  return api.get('/users/me/orders');
};

export default api;

