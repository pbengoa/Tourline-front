import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL - change this for production
const BASE_URL = 'http://192.168.1.27:3001/api';

// For iOS simulator, localhost works. For Android emulator, use 10.0.2.2
// For physical device, use your computer's IP address
export const API_CONFIG = {
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // Initial delay in ms
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Status codes to retry
  retryableErrors: ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'NETWORK_ERROR'],
};

// Create axios instance
export const api: AxiosInstance = axios.create(API_CONFIG);

// Track retry attempts per request
interface RetryState {
  retryCount: number;
}

// Extend axios config to include retry state
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retryState?: RetryState;
  }
}

// Token storage keys
export const TOKEN_KEY = '@tourline_token';
export const USER_KEY = '@tourline_user';

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    // Debug logging
    console.log(`🔑 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`🔑 Token exists: ${!!token}`);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Helper function to check if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
  // Network errors (no response)
  if (!error.response) {
    const errorCode = (error as any).code;
    return RETRY_CONFIG.retryableErrors.includes(errorCode) || error.message === 'Network Error';
  }
  
  // Retryable status codes
  return RETRY_CONFIG.retryableStatuses.includes(error.response.status);
};

// Helper function to calculate delay with exponential backoff
const getRetryDelay = (retryCount: number): number => {
  // Exponential backoff: 1s, 2s, 4s, etc. with some jitter
  const delay = RETRY_CONFIG.retryDelay * Math.pow(2, retryCount);
  const jitter = delay * 0.1 * Math.random(); // Add 10% jitter
  return delay + jitter;
};

// Sleep helper
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Response interceptor - handle errors with retry logic
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config;
    
    if (!config) {
      return Promise.reject(error);
    }

    console.log(`❌ API Error: ${config.url} - ${error.response?.status || 'Network Error'}`);
    
    // Initialize retry state
    if (!config._retryState) {
      config._retryState = { retryCount: 0 };
    }

    const { retryCount } = config._retryState;
    
    // Check if we should retry
    if (retryCount < RETRY_CONFIG.maxRetries && isRetryableError(error)) {
      config._retryState.retryCount += 1;
      
      const delay = getRetryDelay(retryCount);
      console.log(`🔄 Retrying request (${config._retryState.retryCount}/${RETRY_CONFIG.maxRetries}) in ${Math.round(delay)}ms...`);
      
      await sleep(delay);
      
      // Retry the request
      return api(config);
    }

    // Handle 401 errors
    if (error.response?.status === 401) {
      const url = config.url || '';
      // Only clear storage if it's an auth validation endpoint (getMe)
      if (url.includes('/auth/me')) {
        console.log('🔓 Token invalid on /auth/me - clearing storage');
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      } else {
        console.log('⚠️ 401 on non-auth endpoint - NOT clearing token');
      }
    }
    
    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    message: string;
  };
}

// Helper to handle API errors
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    return axiosError.response?.data?.error?.message || axiosError.message || 'Error de conexión';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido';
};

// Get error type for error screen
export type ApiErrorType = 'network' | 'server' | 'notFound' | 'unauthorized' | 'generic';

export const getErrorType = (error: unknown): ApiErrorType => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Network error (no response)
    if (!axiosError.response) {
      return 'network';
    }
    
    const status = axiosError.response.status;
    
    if (status === 401 || status === 403) {
      return 'unauthorized';
    }
    
    if (status === 404) {
      return 'notFound';
    }
    
    if (status >= 500) {
      return 'server';
    }
  }
  
  return 'generic';
};

// Check if error is a network error
export const isNetworkError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return !error.response && (error.message === 'Network Error' || error.code === 'ECONNABORTED');
  }
  return false;
};
