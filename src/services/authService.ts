import { api, ApiResponse, TOKEN_KEY, USER_KEY } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getErrorMessage, formatErrorForLog } from '../utils/errorMessages';

// User Role type
export type UserRole = 'tourist' | 'guide' | 'admin' | 'provider';

// Map backend roles to frontend roles
const mapBackendRole = (backendRole: string): UserRole => {
  console.log('🎭 Raw backend role:', backendRole);
  const roleMap: { [key: string]: UserRole } = {
    USER: 'tourist',
    TOURIST: 'tourist',
    GUIDE: 'guide',
    ADMIN: 'admin',
    PROVIDER: 'provider',
    // Also handle lowercase
    user: 'tourist',
    tourist: 'tourist',
    guide: 'guide',
    admin: 'admin',
    provider: 'provider',
  };
  const mappedRole = roleMap[backendRole] || 'tourist';
  console.log('🎭 Mapped role:', mappedRole);
  return mappedRole;
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
  logoUrl?: string;
  coverImage?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city: string;
  country: string;
  isVerified: boolean;
  isActive: boolean;
  status?: string;
  rating?: number;
  reviewCount?: number;
  tourCount?: number;
  socialLinks?: Record<string, string>;
  operatingHours?: Record<string, { open: string; close: string }>;
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

export interface VerifyEmailRequest {
  token?: string;  // For link-based verification
  code?: string;   // For code-based verification
  email?: string;  // Email to verify
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token?: string;  // Deprecated - usar code
  code?: string;   // Código de 6 dígitos
  email?: string;  // Email asociado
  newPassword: string;
}

// Transform user from backend format
const transformUser = (backendUser: any): User => {
  console.log('🔄 Transforming user from backend:', JSON.stringify(backendUser, null, 2));
  
  // Handle nested user object (from /auth/me endpoint)
  const userData = backendUser.user ? backendUser.user : backendUser;
  
  console.log('📦 Extracted user data, role:', userData.role);
  
  // Transform snake_case to camelCase and handle both formats
  const transformed: User = {
    id: userData.id,
    email: userData.email,
    firstName: userData.firstName || userData.first_name || '',
    lastName: userData.lastName || userData.last_name || '',
    role: mapBackendRole(userData.role),
    avatar: userData.avatar || userData.avatarUrl || userData.avatar_url,
    bio: userData.bio,
    city: userData.city,
    country: userData.country,
    phone: userData.phone,
    companyId: userData.companyId || userData.company_id,
    companyName: userData.companyName || userData.company_name,
    guideProfileId: userData.guideProfileId || userData.guide_profile_id,
    isActive: userData.isActive ?? userData.is_active ?? true,
    emailVerified: userData.emailVerified ?? userData.email_verified ?? false,
    createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
    updatedAt: userData.updatedAt || userData.updated_at || new Date().toISOString(),
  };
  
  console.log('✅ Transformed user:', JSON.stringify(transformed, null, 2));
  return transformed;
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
  // Register new user - Always use real backend
  async register(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    // Transform role for backend if needed
    const backendData = {
      ...data,
      role: data.role === 'tourist' ? 'USER' : data.role?.toUpperCase(),
    };

    try {
      console.log('📝 Attempting registration to backend for:', data.email);
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', backendData);

      if (response.data.success) {
        // Transform user role
        response.data.data.user = transformUser(response.data.data.user);
        // Store token and user
        await AsyncStorage.setItem(TOKEN_KEY, response.data.data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
        console.log('✅ Registration successful, token stored');
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Registration failed:', formatErrorForLog(error));
      throw new Error(getErrorMessage(error));
    }
  },

  // Login - Always use real backend
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('🔐 Attempting login to backend for:', data.email);
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);

      if (response.data.success) {
        // Transform user role
        response.data.data.user = transformUser(response.data.data.user);
        // Store token and user
        await AsyncStorage.setItem(TOKEN_KEY, response.data.data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
        console.log('✅ Login successful, token stored');
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Login failed:', formatErrorForLog(error));
      throw new Error(getErrorMessage(error));
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
    return user?.role === 'admin';
  },

  // Check if user has guide role
  isGuide(user: User | null): boolean {
    return user?.role === 'guide';
  },

  // Check if user is tourist
  isTourist(user: User | null): boolean {
    return user?.role === 'tourist';
  },

  // ============ EMAIL VERIFICATION ============

  /**
   * Verify email with token or code
   * POST /api/auth/verify-email
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<{ message: string; user?: User }>> {
    try {
      console.log('📧 Verifying email...');
      const response = await api.post<ApiResponse<{ message: string; user?: User }>>(
        '/auth/verify-email',
        data
      );

      if (response.data.success && response.data.data.user) {
        // Update stored user with verified status
        const storedUser = await this.getStoredUser();
        if (storedUser) {
          const updatedUser = { ...storedUser, emailVerified: true };
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        }
        console.log('✅ Email verified successfully');
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Email verification failed:', formatErrorForLog(error));
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  async resendVerification(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('📤 Resending verification email to:', email);
      const response = await api.post<ApiResponse<{ message: string }>>(
        '/auth/resend-verification',
        { email }
      );
      console.log('✅ Verification email sent');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to resend verification:', formatErrorForLog(error));
      throw new Error(getErrorMessage(error));
    }
  },

  // ============ PASSWORD RESET ============

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🔑 Requesting password reset for:', email);
      const response = await api.post<ApiResponse<{ message: string }>>(
        '/auth/forgot-password',
        { email }
      );
      console.log('✅ Password reset email sent');
      return response.data;
    } catch (error: any) {
      console.error('❌ Forgot password failed:', formatErrorForLog(error));
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Verify reset code (optional - validates code before password change)
   * POST /api/auth/verify-reset-code
   */
  async verifyResetCode(email: string, code: string): Promise<ApiResponse<{ valid: boolean }>> {
    try {
      console.log('🔍 Verifying reset code...');
      const response = await api.post<ApiResponse<{ valid: boolean }>>(
        '/auth/verify-reset-code',
        { email, code }
      );
      console.log('✅ Reset code verified');
      return response.data;
    } catch (error: any) {
      console.error('❌ Reset code verification failed:', formatErrorForLog(error));
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Reset password with code or token
   * POST /api/auth/reset-password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🔐 Resetting password...');
      const response = await api.post<ApiResponse<{ message: string }>>(
        '/auth/reset-password',
        data
      );
      console.log('✅ Password reset successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Password reset failed:', formatErrorForLog(error));
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Check if email is verified for a user
   */
  async checkEmailVerified(): Promise<boolean> {
    try {
      const user = await this.getMe();
      return user.data?.emailVerified ?? false;
    } catch {
      const storedUser = await this.getStoredUser();
      return storedUser?.emailVerified ?? false;
    }
  },
};
