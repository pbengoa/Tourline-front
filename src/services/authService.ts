import { api, ApiResponse, TOKEN_KEY, USER_KEY } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'GUIDE' | 'ADMIN';
  avatar?: string;
  bio?: string;
  city?: string;
  country?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Auth Service
export const authService = {
  // Register new user
  async register(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', data);
    
    if (response.data.success) {
      // Store token and user
      await AsyncStorage.setItem(TOKEN_KEY, response.data.data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  // Login
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
    
    if (response.data.success) {
      // Store token and user
      await AsyncStorage.setItem(TOKEN_KEY, response.data.data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  // Get current user profile
  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await api.patch<ApiResponse<{ message: string }>>('/auth/change-password', data);
    return response.data;
  },

  // Logout - clear stored data
  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  // Get stored token
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  // Get stored user
  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
};

