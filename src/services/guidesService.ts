import { api, ApiResponse } from './api';

// Types
export type Specialty =
  | 'CULTURAL'
  | 'ADVENTURE'
  | 'GASTRONOMIC'
  | 'HISTORICAL'
  | 'NATURE'
  | 'URBAN'
  | 'RELIGIOUS'
  | 'PHOTOGRAPHY'
  | 'WINE'
  | 'NIGHTLIFE';

export interface Guide {
  id: string;
  userId: string;
  bio: string;
  city: string;
  region?: string;
  country: string;
  languages: string[];
  specialties: Specialty[];
  pricePerHour: number;
  currency: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  available: boolean;
  responseTime?: string;
  memberSince: string;
  createdAt: string;
  updatedAt: string;
  // User info (joined)
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  // Computed
  name?: string;
  avatar?: string;
}

export interface Review {
  id: string;
  guideId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CreateReviewRequest {
  rating: number;
  title: string;
  comment: string;
}

export interface SearchGuidesParams {
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'price' | 'experience' | 'reviews' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  city?: string;
  region?: string;
  country?: string;
  languages?: string;
  specialties?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  query?: string;
}

export interface CreateGuideRequest {
  bio: string;
  city: string;
  region?: string;
  country: string;
  languages: string[];
  specialties: Specialty[];
  pricePerHour: number;
  currency?: string;
  yearsExperience?: number;
}

export interface GuideStats {
  totalBookings: number;
  completedBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
}

// Guides Service
export const guidesService = {
  // Search guides with filters
  async searchGuides(params?: SearchGuidesParams): Promise<ApiResponse<Guide[]>> {
    const response = await api.get<ApiResponse<Guide[]>>('/guides', { params });
    return response.data;
  },

  // Get featured guides
  async getFeaturedGuides(): Promise<ApiResponse<Guide[]>> {
    const response = await api.get<ApiResponse<Guide[]>>('/guides/featured');
    return response.data;
  },

  // Get guide by ID
  async getGuide(id: string): Promise<ApiResponse<Guide>> {
    const response = await api.get<ApiResponse<Guide>>(`/guides/${id}`);
    return response.data;
  },

  // Get guide reviews
  async getGuideReviews(guideId: string): Promise<ApiResponse<Review[]>> {
    const response = await api.get<ApiResponse<Review[]>>(`/guides/${guideId}/reviews`);
    return response.data;
  },

  // Create guide profile (become a guide)
  async createGuide(data: CreateGuideRequest): Promise<ApiResponse<Guide>> {
    const response = await api.post<ApiResponse<Guide>>('/guides', data);
    return response.data;
  },

  // Update my guide profile
  async updateGuide(id: string, data: Partial<CreateGuideRequest>): Promise<ApiResponse<Guide>> {
    const response = await api.patch<ApiResponse<Guide>>(`/guides/${id}`, data);
    return response.data;
  },

  // Delete my guide profile
  async deleteGuide(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/guides/${id}`);
    return response.data;
  },

  // Create review for a guide
  async createReview(guideId: string, data: CreateReviewRequest): Promise<ApiResponse<Review>> {
    const response = await api.post<ApiResponse<Review>>(`/guides/${guideId}/reviews`, data);
    return response.data;
  },

  // Get my guide profile (for guides)
  async getMyGuideProfile(): Promise<ApiResponse<Guide>> {
    const response = await api.get<ApiResponse<Guide>>('/guides/me');
    return response.data;
  },

  // Get my stats (for guides)
  async getMyStats(): Promise<ApiResponse<GuideStats>> {
    const response = await api.get<ApiResponse<GuideStats>>('/guides/me/stats');
    return response.data;
  },
};

