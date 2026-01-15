import { api, ApiResponse } from './api';

// ============ TYPES ============

export interface FavoriteTour {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  duration: number;
  city: string;
  country: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  addedAt: string;  // When user added to favorites
}

export interface Favorite {
  id: string;
  tourId: string;
  tour: FavoriteTour;
  createdAt: string;
}

// ============ SERVICE ============

export const favoritesService = {
  /**
   * Get user's favorite tours
   * GET /api/favorites
   */
  async getAll(): Promise<ApiResponse<Favorite[]>> {
    const response = await api.get<ApiResponse<Favorite[]>>('/favorites');
    return response.data;
  },

  /**
   * Add tour to favorites
   * POST /api/favorites
   */
  async add(tourId: string): Promise<ApiResponse<Favorite>> {
    const response = await api.post<ApiResponse<Favorite>>('/favorites', { tourId });
    return response.data;
  },

  /**
   * Remove tour from favorites
   * DELETE /api/favorites/:tourId
   */
  async remove(tourId: string): Promise<void> {
    await api.delete(`/favorites/${tourId}`);
  },

  /**
   * Check if tour is in favorites
   * GET /api/favorites/check/:tourId
   */
  async check(tourId: string): Promise<{ isFavorite: boolean }> {
    const response = await api.get<{ success: boolean; data: { isFavorite: boolean } }>(
      `/favorites/check/${tourId}`
    );
    return response.data.data;
  },

  /**
   * Toggle favorite status (convenience method)
   */
  async toggle(tourId: string, currentStatus: boolean): Promise<boolean> {
    if (currentStatus) {
      await favoritesService.remove(tourId);
      return false;
    } else {
      await favoritesService.add(tourId);
      return true;
    }
  },

  /**
   * Get favorites count
   * GET /api/favorites/count
   */
  async getCount(): Promise<number> {
    const response = await api.get<{ success: boolean; data: { count: number } }>(
      '/favorites/count'
    );
    return response.data.data.count;
  },
};

