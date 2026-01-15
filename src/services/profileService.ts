import { api, ApiResponse } from './api';
import { User } from './authService';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  city?: string;
  country?: string;
  phone?: string;
}

export interface UpdateAvatarRequest {
  avatarUrl: string;
}

// Profile Service
export const profileService = {
  // Get my complete profile
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/profile');
    return response.data;
  },

  // Update my profile
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>('/profile', data);
    return response.data;
  },

  // Update avatar
  async updateAvatar(data: UpdateAvatarRequest): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>('/profile/avatar', data);
    return response.data;
  },
};

