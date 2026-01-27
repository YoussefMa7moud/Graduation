import api from '../api';
import type { OCLGenerationResponse } from '../../components/Company/PolicyConverter/Data/types';

export interface PolicyConvertRequest {
  policyName: string;
  legalFramework: string;
  policyText: string;
}

export interface PolicySaveRequest {
  policyName: string;
  legalFramework: string;
  policyText: string;
  oclCode: string;
  explanation: string;
  articleRef: string;
  category: string;
  keywords: string[];
}

export interface PolicyResponse {
  id: number;
  policyName: string;
  legalFramework: string;
  policyText: string;
  oclCode: string;
  explanation: string;
  articleRef: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Convert policy text to OCL constraint code
 */
export const convertPolicy = async (
  request: PolicyConvertRequest
): Promise<OCLGenerationResponse> => {
  try {
    // Check if user is authenticated before making the request
    const { getToken } = await import('../../utils/auth.utils');
    const token = getToken();
    
    if (!token) {
      throw new Error('You must be logged in to convert policies. Please log in and try again.');
    }

    const response = await api.post<OCLGenerationResponse>(
      '/api/policies/convert',
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Error converting policy:', error);
    
    // Handle 401 specifically
    if (error.response?.status === 401) {
      const { clearAuth } = await import('../../utils/auth.utils');
      clearAuth();
      throw new Error('Your session has expired. Please log in again.');
    }
    
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to convert policy';
    throw new Error(errorMessage);
  }
};

/**
 * Save policy to database
 */
export const savePolicy = async (
  request: PolicySaveRequest
): Promise<PolicyResponse> => {
  try {
    const response = await api.post<PolicyResponse>(
      '/api/policies/save',
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Error saving policy:', error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to save policy';
    throw new Error(errorMessage);
  }
};

/**
 * Get all policies for the current company
 */
export const getPolicies = async (): Promise<PolicyResponse[]> => {
  try {
    const response = await api.get<PolicyResponse[]>('/api/policies');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching policies:', error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch policies';
    throw new Error(errorMessage);
  }
};
