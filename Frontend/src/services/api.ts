/**
 * API Service
 * 
 * Centralized axios instance with interceptors for:
 * - Automatic JWT token injection
 * - 401 error handling (token expiration)
 * - Request/response logging (development only)
 */

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/api.config';
import { getToken, clearAuth } from '../utils/auth.utils';

/**
 * Create axios instance with base configuration
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: false, // Set to true if your backend requires credentials
});

/**
 * Request Interceptor
 * Automatically adds Authorization header with JWT token to all requests
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = getToken();
      
      // Add token to request headers if available
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // If token retrieval fails, continue without token
      console.warn('[API] Error getting token:', error);
    }

    // Don't set Content-Type for FormData (browser will set it automatically with boundary)
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    // Log request in development mode
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data instanceof FormData ? '[FormData]' : config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    // Handle request error
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles 401 errors (unauthorized) by clearing token and redirecting to login
 */
api.interceptors.response.use(
  (response) => {
    // Log response in development mode
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      console.warn('[API] Unauthorized - clearing auth and redirecting to login');
      
      // Clear authentication data
      try {
        clearAuth();
      } catch (e) {
        console.error('Error clearing auth:', e);
      }
      
      // Redirect to login page only if we're not already there
      // Use setTimeout to avoid issues during React rendering
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
        setTimeout(() => {
          window.location.href = '/auth';
        }, 100);
      }
    }

    // Log error in development mode
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
