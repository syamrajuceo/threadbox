import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes timeout for long-running operations like email ingestion
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Handle network errors (timeout, connection issues)
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      const isTimeout = error.code === 'ECONNABORTED';
      error.message = isTimeout
        ? 'Request timeout. The operation is taking longer than expected. Please check if the backend is processing the request.'
        : 'Network error. Please check if the backend server is running and accessible.';
    }
    
    return Promise.reject(error);
  },
);

