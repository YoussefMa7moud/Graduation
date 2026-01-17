/**
 * Authentication Utilities v2.0
 *
 * Helper functions for managing authentication tokens and user data in localStorage.
 * This version is aligned with the type-safe role system.
 */

import type { User } from '../contexts/AuthContext';

// --- CONSTANTS ---
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// --- TOKEN MANAGEMENT ---

/**
 * Saves the authentication token and its expiry time to localStorage.
 * @param token The JWT token string.
 */
export const saveToken = (token: string): void => {
  try {
    const expiryTime = Date.now() + TOKEN_EXPIRY_TIME;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error('Error saving token to localStorage:', error);
  }
};

/**
 * Retrieves the authentication token from localStorage.
 * @returns The token string, or null if it's not found or expired.
 */
export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (token && expiryTime) {
      const expiry = parseInt(expiryTime, 10);
      if (!isNaN(expiry) && Date.now() < expiry) {
        return token;
      }
    }
    // If token is expired or missing, clear everything for consistency
    clearAuth();
    return null;
  } catch (error) {
    console.warn('Error accessing token from localStorage:', error);
    return null;
  }
};

// --- USER MANAGEMENT ---

/**
 * Saves the user object to localStorage.
 * @param user The user object with a normalized FrontendRole.
 */
export const saveUser = (user: User): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

/**
 * Retrieves the user object from localStorage.
 * Also checks for token validity. If the token is invalid, it returns null.
 * @returns The user object, or null if not found or if the session is invalid.
 */
export const getUser = (): User | null => {
  // If the session is not authenticated, there's no valid user.
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      const user = JSON.parse(userStr) as User;
      // Basic validation to ensure the object from storage has the expected shape.
      if (user && typeof user.userId === 'number' && typeof user.role === 'string') {
        return user;
      }
    }
  } catch (error) {
    console.error('Error retrieving or parsing user from localStorage:', error);
  }
  
  // If anything fails, return null
  return null;
};


// --- SESSION MANAGEMENT ---

/**
 * Clears all authentication data (token and user) from localStorage.
 * This effectively ends the user's session in the browser.
 */
export const clearAuth = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.warn('Error clearing auth from localStorage:', error);
  }
};

/**
 * Checks if the user is authenticated by verifying the presence and validity of the token.
 * This is the single source of truth for session validity.
 * @returns true if a valid, non-expired token exists.
 */
export const isAuthenticated = (): boolean => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiryTime) {
      return false;
    }

    const expiry = parseInt(expiryTime, 10);
    return !isNaN(expiry) && Date.now() < expiry;
  } catch (error) {
    console.warn('Error checking authentication status:', error);
    return false;
  }
};