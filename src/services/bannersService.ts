import { api, ApiResponse } from './api';

// ============ TYPES ============

export type BannerActionType = 'tour' | 'category' | 'region' | 'url' | 'search';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  actionType: BannerActionType;
  actionValue: string;  // tour_id, category_slug, region_slug, or URL
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  sortOrder: number;
}

export type BannerPlacement = 'home' | 'search' | 'profile';

// ============ SERVICE ============

export const bannersService = {
  /**
   * Get active banners for a specific placement
   * GET /api/banners?placement=home
   */
  async getByPlacement(placement: BannerPlacement = 'home'): Promise<ApiResponse<Banner[]>> {
    const response = await api.get<ApiResponse<Banner[]>>('/banners', {
      params: { placement },
    });
    return response.data;
  },

  /**
   * Get all active banners
   * GET /api/banners
   */
  async getAll(): Promise<ApiResponse<Banner[]>> {
    const response = await api.get<ApiResponse<Banner[]>>('/banners');
    return response.data;
  },

  /**
   * Track banner click (for analytics)
   * POST /api/banners/:id/click
   */
  async trackClick(bannerId: string): Promise<void> {
    await api.post(`/banners/${bannerId}/click`);
  },
};

