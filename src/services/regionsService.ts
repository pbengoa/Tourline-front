import { api, ApiResponse } from './api';

// ============ TYPES ============

export interface Region {
  id: string;
  name: string;
  slug: string;
  country: string;
  description?: string;
  imageUrl?: string;
  tourCount: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isFeatured: boolean;
  sortOrder: number;
}

export interface RegionWithTours extends Region {
  tours: {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
    price: number;
    currency: string;
    rating: number;
    reviewCount: number;
  }[];
}

// ============ SERVICE ============

export const regionsService = {
  /**
   * Get all regions
   * GET /api/regions
   */
  async getAll(): Promise<ApiResponse<Region[]>> {
    const response = await api.get<ApiResponse<Region[]>>('/regions');
    return response.data;
  },

  /**
   * Get featured regions (for Home screen)
   * GET /api/regions/featured
   */
  async getFeatured(): Promise<ApiResponse<Region[]>> {
    const response = await api.get<ApiResponse<Region[]>>('/regions/featured');
    return response.data;
  },

  /**
   * Get region by slug with tours
   * GET /api/regions/:slug
   */
  async getBySlug(slug: string): Promise<ApiResponse<RegionWithTours>> {
    const response = await api.get<ApiResponse<RegionWithTours>>(`/regions/${slug}`);
    return response.data;
  },

  /**
   * Get tours by region
   * GET /api/regions/:slug/tours
   */
  async getTours(slug: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<ApiResponse<RegionWithTours['tours']>> {
    const response = await api.get<ApiResponse<RegionWithTours['tours']>>(
      `/regions/${slug}/tours`,
      { params }
    );
    return response.data;
  },
};

