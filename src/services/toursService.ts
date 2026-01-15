import { api, ApiResponse } from './api';

// ============ TYPES ============

// Company info (NEW - replaces guide)
export interface TourCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

// Certified guide for tour (NEW)
export interface CertifiedGuide {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
}

// Main Tour interface (UPDATED)
export interface ApiTour {
  id: string;
  companyId: string;           // ⚠️ CHANGED from guideId
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  
  // Images - images[0] is cover, rest is gallery
  images: string[];
  
  // Location
  city: string;
  region?: string;
  country: string;
  meetingPoint?: string;
  meetingPointLat?: number;
  meetingPointLng?: number;
  meetingPointInstructions?: string;
  
  // Tour details
  duration: number; // in minutes
  maxParticipants: number;
  price: number;
  currency: string;
  categories: string[];
  includes: string[];
  notIncludes?: string[];
  requirements?: string[];
  difficulty?: 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';
  languages: string[];
  
  // Ratings
  rating: number;
  reviewCount: number;
  
  // Status
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Company info (NEW - replaces guide)
  company?: TourCompany;
  
  // Certified guides for this tour (NEW)
  certifiedGuides?: CertifiedGuide[];
  
  // DEPRECATED - keeping for backwards compatibility
  guideId?: string;
  guide?: {
    id: string;
    userId: string;
    rating: number;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

export interface SearchToursParams {
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'price' | 'duration' | 'reviews' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  city?: string;
  region?: string;
  country?: string;
  category?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  query?: string;
  difficulty?: string;
  companyId?: string;          // NEW filter
}

// ============ TOURS SERVICE ============

export const toursService = {
  /**
   * Search tours with filters
   */
  async searchTours(params?: SearchToursParams): Promise<ApiResponse<ApiTour[]>> {
    const response = await api.get<ApiResponse<ApiTour[]>>('/tours', { params });
    return response.data;
  },

  /**
   * Get featured tours
   */
  async getFeaturedTours(): Promise<ApiResponse<ApiTour[]>> {
    const response = await api.get<ApiResponse<ApiTour[]>>('/tours/featured');
    return response.data;
  },

  /**
   * Get tour by ID or slug
   */
  async getTour(idOrSlug: string): Promise<ApiResponse<ApiTour>> {
    const response = await api.get<ApiResponse<ApiTour>>(`/tours/${idOrSlug}`);
    return response.data;
  },

  /**
   * Get tours by city
   */
  async getToursByCity(city: string): Promise<ApiResponse<ApiTour[]>> {
    const response = await api.get<ApiResponse<ApiTour[]>>(`/tours/city/${encodeURIComponent(city)}`);
    return response.data;
  },

  /**
   * Get tours by company (NEW)
   */
  async getToursByCompany(companyId: string): Promise<ApiResponse<ApiTour[]>> {
    const response = await api.get<ApiResponse<ApiTour[]>>('/tours', { 
      params: { companyId } 
    });
    return response.data;
  },
};
