import axios from 'axios';
import { toast } from 'react-toastify';

// Get API URL from environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Log API configuration when the module loads
console.log('API URL:', API_URL);
console.log('Environment Variables Loaded:', !!import.meta.env.VITE_API_URL);

// Create an axios instance with some default settings
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Keep token keys consistent
const USER_TOKEN_KEY = 'userToken';
const ADMIN_TOKEN_KEY = 'adminToken';

// Enhanced request interceptor for adding the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Determine which token to use based on the endpoint being accessed
    let token = null;
    
    // Special handling for authentication endpoints - don't add any token for signin endpoints
    if (config.url.includes('/signin') || config.url.includes('/signup')) {
      // Don't add any token for authentication endpoints
      console.log(`[API] Not using token for auth endpoint: ${config.url}`);
      return config;
    }
    
    // Admin endpoints should use admin token
    if (config.url.includes('/admin/') || config.url === '/bookings/admin') {
      token = localStorage.getItem(ADMIN_TOKEN_KEY);
      console.log(`[API] Using admin token for admin endpoint: ${config.url}`);
    } else {
      // For user endpoints, use user token
      token = localStorage.getItem(USER_TOKEN_KEY);
      
      // Only fall back to admin token if explicitly needed for special cases
      if (!token && config.headers['Use-Admin-Token']) {
        token = localStorage.getItem(ADMIN_TOKEN_KEY);
        console.log(`[API] Falling back to admin token with special header for: ${config.url}`);
      }
      
      console.log(`[API] Using ${token ? 'user' : 'no'} token for request to ${config.url}`);
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('API Error:', error.config || 'No config');
    
    if (error.response) {
      // Handle specific error cases
      const status = error.response.status;
      
      // Handle authentication errors
      if (status === 401) {
        if (error.config.url.includes('/admin/')) {
          // Admin auth error
          console.log('Admin authentication error - clearing admin token');
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          
          if (!error.config.url.includes('/signin')) {
            toast.error('Admin session expired. Please log in again.');
          }
        } else {
          // User auth error
          console.log('User authentication error - clearing user token');
          localStorage.removeItem(USER_TOKEN_KEY);
          
          if (!error.config.url.includes('/signin')) {
            toast.error('Session expired. Please log in again.');
          }
        }
      }
      
      // Handle server errors
      if (status >= 500) {
        toast.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    }
    
    console.log('API error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (err) => { // Changed variable name from 'error' to 'err' for consistency
    // Handle specific error codes
    if (err.response) {
      const { status } = err.response;
      
      // Handle 401 Unauthorized - could be expired token
      if (status === 401) {
        console.log('API 401 error - clearing auth tokens');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        
        // If on protected route, redirect to login
        if (!window.location.pathname.includes('/auth/')) {
          window.location.href = '/auth/sign-in';
        }
      }
    }
    
    return Promise.reject(err);
  }
);

// Function to test database connection
export const testDatabaseConnection = async () => {
  try {
    const response = await api.get('/system-status');
    return response.data.dbStatus === 'connected';
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Helper function to get user data from API or localStorage
export const getUserData = async () => {
  try {
    // First try to get from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    
    // If not in localStorage, try to get from API
    const response = await api.get('/user/me');
    
    // Save to localStorage for future use
    if (response.data) {
      localStorage.setItem('userData', JSON.stringify(response.data));
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export default api;