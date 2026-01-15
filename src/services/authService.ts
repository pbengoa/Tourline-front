import { api, ApiResponse, TOKEN_KEY, USER_KEY } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User Role type
export type UserRole = 'tourist' | 'guide' | 'admin' | 'super_admin';

// Map backend roles to frontend roles
const mapBackendRole = (backendRole: string): UserRole => {
  const roleMap: { [key: string]: UserRole } = {
    USER: 'tourist',
    TOURIST: 'tourist',
    GUIDE: 'guide',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
  };
  return roleMap[backendRole] || 'tourist';
};

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  city?: string;
  country?: string;
  phone?: string;
  companyId?: string;
  companyName?: string;
  guideProfileId?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city: string;
  country: string;
  isVerified: boolean;
  isActive: boolean;
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
  role?: UserRole;
  companyName?: string; // Required if role is 'admin'
}

export interface LoginResponse {
  token: string;
  user: User;
  company?: Company;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Transform user from backend format
const transformUser = (backendUser: any): User => {
  return {
    ...backendUser,
    role: mapBackendRole(backendUser.role),
  };
};

// Mock users for demo/development
const MOCK_USERS: { [email: string]: { password: string; user: User } } = {
  'user@tourline.com': {
    password: 'user123456',
    user: {
      id: 'user-1',
      email: 'user@tourline.com',
      firstName: 'María',
      lastName: 'González',
      role: 'tourist',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      city: 'Santiago',
      country: 'Chile',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'admin@tourline.com': {
    password: 'admin123456',
    user: {
      id: 'admin-1',
      email: 'admin@tourline.com',
      firstName: 'Carlos',
      lastName: 'Administrador',
      role: 'admin',
      companyId: 'company-1',
      companyName: 'Aventuras Chile',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      city: 'Santiago',
      country: 'Chile',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'guide@tourline.com': {
    password: 'guide123456',
    user: {
      id: 'guide-1',
      email: 'guide@tourline.com',
      firstName: 'Carolina',
      lastName: 'Muñoz',
      role: 'guide',
      guideProfileId: 'guide-profile-1',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      city: 'Santiago',
      country: 'Chile',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

// Auth Service
export const authService = {
  // Register new user
  async register(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    // Transform role for backend if needed
    const backendData = {
      ...data,
      role: data.role === 'tourist' ? 'USER' : data.role?.toUpperCase(),
    };

    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', backendData);

      if (response.data.success) {
        // Transform user role
        response.data.data.user = transformUser(response.data.data.user);
        // Store token and user
        await AsyncStorage.setItem(TOKEN_KEY, response.data.data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      // Fallback to mock registration
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'tourist',
        companyId: data.role === 'admin' ? `company-${Date.now()}` : undefined,
        companyName: data.companyName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockToken = `mock-token-${Date.now()}`;
      await AsyncStorage.setItem(TOKEN_KEY, mockToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUser));

      return {
        success: true,
        data: { user: mockUser, token: mockToken },
      };
    }
  },

  // Login
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Check mock users first (for development/demo)
    const mockUserData = MOCK_USERS[data.email.toLowerCase()];
    if (mockUserData && mockUserData.password === data.password) {
      const mockToken = `mock-token-${Date.now()}`;
      await AsyncStorage.setItem(TOKEN_KEY, mockToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUserData.user));

      return {
        success: true,
        data: { user: mockUserData.user, token: mockToken },
      };
    }

    // Try real API
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);

      if (response.data.success) {
        // Transform user role
        response.data.data.user = transformUser(response.data.data.user);
        // Store token and user
        await AsyncStorage.setItem(TOKEN_KEY, response.data.data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      // If API fails and not a mock user, throw error
      throw new Error('Credenciales incorrectas');
    }
  },

  // Get current user profile
  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    if (response.data.success) {
      response.data.data = transformUser(response.data.data);
    }
    return response.data;
  },

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await api.patch<ApiResponse<{ message: string }>>(
      '/auth/change-password',
      data
    );
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

  // Check if user has admin role
  isAdmin(user: User | null): boolean {
    return user?.role === 'admin' || user?.role === 'super_admin';
  },

  // Check if user has guide role
  isGuide(user: User | null): boolean {
    return user?.role === 'guide';
  },

  // Check if user is tourist
  isTourist(user: User | null): boolean {
    return user?.role === 'tourist';
  },
};
