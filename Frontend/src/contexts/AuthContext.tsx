/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Manages user login status, user data, and authentication operations.
 */


import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { getUser, isAuthenticated, clearAuth, saveUser } from '../utils/auth.utils';
import { login as loginService, register as registerService, logout as logoutService } from '../services/auth.service';
import type { LoginRequest, RegisterRequest } from '../services/auth.service';
import type { FrontendRole } from '../utils/role.utils';
import { normalizeRole } from '../utils/role.utils';

/**
 * User information type. The role is a normalized, type-safe FrontendRole.
 */
export interface User {
  userId: number;
  email: string;
  role: FrontendRole;
}

/**
 * Authentication context type
 */
interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Methods
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Create authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * Wraps the application and provides authentication state and methods.
 * Automatically loads user data from localStorage on mount.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Login function
   * Calls the login service, normalizes the role, and updates context state.
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await loginService(credentials);
      
      // Normalize the role from the backend
      const normalizedRole = normalizeRole(response.role);

      const userToStore: User = {
        userId: response.userId,
        email: response.email,
        role: normalizedRole,
      };

      // Save the normalized user object and update state
      saveUser(userToStore);
      setUser(userToStore);

    } catch (error: any) {
      // On error, ensure user state is cleared
      clearAuth();
      setUser(null);
      // Re-throw error so components can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register function
   * Calls the register service. Does not log the user in.
   */
  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      await registerService(data);
    } catch (error: any) {
      // Re-throw error so components can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function
   * Clears all authentication data and updates context state.
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Ensure all local auth data is cleared even if backend call fails
      clearAuth();
      setUser(null);
      setIsLoading(false);
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: user !== null && user.role !== 'unknown' && isAuthenticated(),
    isLoading,
    login,
    register,
    logout,
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 * @returns Authentication context value
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
