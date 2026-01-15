import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL - change this for production
const BASE_URL = 'http://192.168.1.3:3001/api';

// For iOS simulator, localhost works. For Android emulator, use 10.0.2.2
// For physical device, use your computer's IP address
export const API_CONFIG = {
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance
export const api: AxiosInstance = axios.create(API_CONFIG);

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

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error: AxiosError) => {
    console.log(`❌ API Error: ${error.config?.url} - ${error.response?.status}`);
    
    // Only clear token on 401 for auth endpoints, not for all endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
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
