/**
 * Authentication Service
 * 
 * Service for handling authentication API calls:
 * - User registration
 * - User login
 * - Token management
 */

import api from './api';
import { API_ENDPOINTS } from '../config/api.config';
import { saveToken, saveUser, clearAuth } from '../utils/auth.utils';

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  role: 'client' | 'company';
  clientType?: 'individual' | 'corporate';
  firstName: string;
  lastName: string;
  companyName?: string;
  description?: string;
  logo?: File; // The key should be 'logo' to match the backend
}

/**
 * Registration response
 */
export interface RegisterResponse {
  userId: number;
  role: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  role: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  error: string;
}

/**
 * Register a new user
 * @param data - Registration data
 * @returns Registration response with userId and role
 * @throws Error if registration fails
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    // Always use FormData to ensure the Content-Type is 'multipart/form-data'
    const formData = new FormData();

    // Loop through the data object and append each value to the FormData
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      // Only append fields that are not null or undefined
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Send the request using FormData
    const response = await api.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      formData
    );
    
    return response.data;
  } catch (error: any) {
    // Handle CORS errors specifically
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Please check if the backend is running and CORS is configured correctly.');
    }
    
    // Handle CORS policy errors
    if (error.message?.includes('CORS') || error.response?.status === 0) {
      throw new Error('CORS error: Backend server needs to allow requests from this origin. Please configure CORS on your Spring Boot backend.');
    }
    
    // Extract error message from response
    const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
    throw new Error(errorMessage);
  }
};

/**
 * Login user and store token
 * @param data - Login credentials (email and password)
 * @returns Login response with token and user info
 * @throws Error if login fails
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    
    const loginData = response.data;
    
    // Save token and user data to localStorage
    saveToken(loginData.token);
    saveUser({
      userId: loginData.userId,
      email: loginData.email,
      role: loginData.role,
    });
    
    return loginData;
  } catch (error: any) {
    // Handle CORS errors specifically
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Please check if the backend is running and CORS is configured correctly.');
    }
    
    // Handle CORS policy errors
    if (error.message?.includes('CORS') || error.response?.status === 0) {
      throw new Error('CORS error: Backend server needs to allow requests from this origin. Please configure CORS on your Spring Boot backend.');
    }
    
    // Extract error message from response
    const errorMessage = error.response?.data?.error || error.message || 'Login failed';
    throw new Error(errorMessage);
  }
};

/**
 * Logout user (clear local storage)
 * Note: If your backend has a logout endpoint, you can call it here
 */
export const logout = async (): Promise<void> => {
  try {
    // If your backend has a logout endpoint, uncomment this:
    // await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    
    // Clear local storage
    clearAuth();
  } catch (error) {
    // Even if backend logout fails, clear local storage
    clearAuth();
    console.error('Logout error:', error);
  }
};