import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/config/store/authStore'; // Adjust path as needed


// added production
const httpClient = axios.create({
  baseURL: "https://digihostinfra.com/api", 
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token from cookies
httpClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - logout user
    if (error.response?.status === 401) {
      // Check if we're NOT already on the login page
      const currentPath = window.location.pathname;
      
      if (!currentPath.startsWith('/auth/login')) {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
      }
    }
    
    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded');
    }
    
    return Promise.reject(error);
  }
);

export default httpClient;