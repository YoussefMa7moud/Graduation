

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}
import { API_BASE_URL } from '../config/api.config';
import { getToken, clearAuth } from '../utils/auth.utils';

/** Raw token for API calls when client-side expiry has passed but JWT may still be valid server-side. */
function resolveBearerToken(): string | null {
  const fromGet = getToken();
  if (fromGet) {
    return fromGet;
  }
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

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
      const token = resolveBearerToken();

      if (token && config.headers) {
        const h = config.headers as { set?: (k: string, v: string) => void } & Record<string, string>;
        if (typeof h.set === 'function') {
          h.set('Authorization', `Bearer ${token}`);
        } else {
          h.Authorization = `Bearer ${token}`;
        }
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
    // Only force logout when we sent a token and the server rejected it (session invalid).
    if (error.response?.status === 401) {
      const headers = error.config?.headers;
      const hadAuth = Boolean(
        headers &&
          (headers.Authorization ||
            (headers as Record<string, string>).authorization ||
            (typeof (headers as { get?: (k: string) => string }).get === 'function' &&
              (headers as { get: (k: string) => string }).get('Authorization')))
      );
      const url = error.config?.url ?? '';
      const isTaskApi = url.includes('/tasks');
      const skipRedirect = error.config?.skipAuthRedirect || isTaskApi;

      if (hadAuth && !skipRedirect) {
        console.warn('[API] Session rejected (401) - clearing auth and redirecting to login');

        try {
          clearAuth();
        } catch (e) {
          console.error('Error clearing auth:', e);
        }

        if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
          setTimeout(() => {
            window.location.href = '/auth';
          }, 100);
        }
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
