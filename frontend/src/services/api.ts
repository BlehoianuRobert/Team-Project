import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let axios set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const requestUrl = String(error.config?.url || '');
      const requestMethod = String(error.config?.method || 'get').toLowerCase();

      const path = requestUrl.replace(/^\/+/, '').split('?')[0];
      const isPublicProductRead =
        requestMethod === 'get' &&
        (path === 'products' ||
          path.startsWith('products/filters/') ||
          /^products\/\d+(\/|$)/.test(path));

      // Failed login/register must not clear storage or force redirect — user stays on the form.
      const isAuthAttempt =
        path === 'auth/login' ||
        path === 'auth/register' ||
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register');

      // Keep user logged in for public catalog requests or auth attempts.
      // For protected endpoints, both 401 and 403 often mean an expired/invalid token.
      if (!isPublicProductRead && !isAuthAttempt) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
