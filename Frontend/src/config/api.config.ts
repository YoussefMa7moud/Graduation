/**
 * API Configuration
 * 
 * Centralized configuration for API base URL and endpoints.
 * Supports environment-based configuration for different deployment environments.
 */

// In dev, use relative URLs so Vite proxies /api → backend (same origin, fewer CORS/auth issues).
// In production, set VITE_API_BASE_URL to your API host.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'http://localhost:8080');

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout', // If your backend has this
    REFRESH: '/api/auth/refresh', // If your backend supports token refresh
  },

  CLIENT: {
    BROWSECOMPANIES: '/api/companies/browse',
    SUBMITPROPOSAL: '/api/proposals/create',
   
  },

  // Add other API endpoints here as needed
  // USER: {
  //   PROFILE: '/api/user/profile',
  //   UPDATE: '/api/user/update',
  // },
} as const;

/**
 * Get full API URL for an endpoint
 * @param endpoint - The endpoint path (e.g., '/api/auth/login')
 * @returns Full URL (e.g., 'http://localhost:8080/api/auth/login')
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${baseUrl}/${cleanEndpoint}`;
};

/**
 * Environment check utilities
 */
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
