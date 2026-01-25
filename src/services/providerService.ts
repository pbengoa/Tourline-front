import { api, ApiResponse, TOKEN_KEY, USER_KEY } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getErrorMessage, formatErrorForLog } from '../utils/errorMessages';
import type {
  Provider,
  ProviderRegistration,
  ProviderRegistrationResponse,
  GuideProfile,
  VerificationDocument,
  ProviderStatus,
} from '../types/provider';

// ============ PROVIDER REGISTRATION ============

/**
 * Register a new provider (individual or company)
 */
export const registerProvider = async (
  data: ProviderRegistration
): Promise<ApiResponse<ProviderRegistrationResponse>> => {
  try {
    console.log('📝 Registering provider:', data.type, data.email);
    
    // Transform data for backend
    const backendData = {
      ...data,
      role: 'PROVIDER',
    };

    const response = await api.post<ApiResponse<ProviderRegistrationResponse>>(
      '/auth/register-provider',
      backendData
    );

    if (response.data.success) {
      // Store token and user
      await AsyncStorage.setItem(TOKEN_KEY, response.data.data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
      console.log('✅ Provider registration successful');
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Provider registration failed:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

// ============ PROVIDER PROFILE ============

/**
 * Get current provider profile
 */
export const getMyProvider = async (): Promise<ApiResponse<Provider>> => {
  try {
    const response = await api.get<ApiResponse<Provider>>('/providers/me');
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get provider:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update provider profile
 */
export const updateProvider = async (
  data: Partial<Provider>
): Promise<ApiResponse<Provider>> => {
  try {
    const response = await api.patch<ApiResponse<Provider>>('/providers/me', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to update provider:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get provider by ID (public)
 */
export const getProviderById = async (id: string): Promise<ApiResponse<Provider>> => {
  try {
    const response = await api.get<ApiResponse<Provider>>(`/providers/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get provider:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

// ============ VERIFICATION DOCUMENTS ============

/**
 * Upload verification document
 */
export const uploadDocument = async (
  document: FormData
): Promise<ApiResponse<VerificationDocument>> => {
  try {
    const response = await api.post<ApiResponse<VerificationDocument>>(
      '/providers/me/documents',
      document,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to upload document:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get my documents
 */
export const getMyDocuments = async (): Promise<ApiResponse<VerificationDocument[]>> => {
  try {
    const response = await api.get<ApiResponse<VerificationDocument[]>>('/providers/me/documents');
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get documents:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (documentId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete<ApiResponse<void>>(`/providers/me/documents/${documentId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to delete document:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

// ============ GUIDE PROFILES (for companies) ============

/**
 * Get guides for my provider
 */
export const getMyGuides = async (): Promise<ApiResponse<GuideProfile[]>> => {
  try {
    const response = await api.get<ApiResponse<GuideProfile[]>>('/providers/me/guides');
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get guides:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Create a new guide profile
 */
export const createGuide = async (
  data: Omit<GuideProfile, 'id' | 'providerId' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<GuideProfile>> => {
  try {
    const response = await api.post<ApiResponse<GuideProfile>>('/providers/me/guides', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to create guide:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Update a guide profile
 */
export const updateGuide = async (
  guideId: string,
  data: Partial<GuideProfile>
): Promise<ApiResponse<GuideProfile>> => {
  try {
    const response = await api.patch<ApiResponse<GuideProfile>>(
      `/providers/me/guides/${guideId}`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to update guide:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Delete a guide profile
 */
export const deleteGuide = async (guideId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete<ApiResponse<void>>(`/providers/me/guides/${guideId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to delete guide:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

// ============ VERIFICATION STATUS ============

/**
 * Check verification status
 */
export const getVerificationStatus = async (): Promise<ApiResponse<{
  status: ProviderStatus;
  message?: string;
  missingDocuments: string[];
  nextSteps: string[];
}>> => {
  try {
    const response = await api.get<ApiResponse<{
      status: ProviderStatus;
      message?: string;
      missingDocuments: string[];
      nextSteps: string[];
    }>>('/providers/me/verification-status');
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get verification status:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Request verification review
 */
export const requestVerification = async (): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<ApiResponse<{ message: string }>>(
      '/providers/me/request-verification'
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to request verification:', formatErrorForLog(error));
    throw new Error(getErrorMessage(error));
  }
};

// Export as service object for consistency
export const providerService = {
  // Registration
  registerProvider,
  
  // Profile
  getMyProvider,
  updateProvider,
  getProviderById,
  
  // Documents
  uploadDocument,
  getMyDocuments,
  deleteDocument,
  
  // Guides
  getMyGuides,
  createGuide,
  updateGuide,
  deleteGuide,
  
  // Verification
  getVerificationStatus,
  requestVerification,
};
