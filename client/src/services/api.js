import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send and receive HTTP-only cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach bearer token from localStorage if user preferred token auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopez_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error messages cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.join(', ') ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
