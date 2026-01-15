import { api, ApiResponse } from './api';

// ============ TYPES ============

export interface AppConfig {
  // Version control
  minAppVersion: string;
  currentAppVersion: string;
  forceUpdate: boolean;
  
  // Feature flags
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  
  // Featured content
  featuredCategories: string[];
  featuredRegions: string[];
  
  // Business settings
  commissionRate: number;
  minBookingAdvance: number;  // Hours in advance required for booking
  maxParticipantsDefault: number;
  
  // Support
  supportEmail: string;
  supportPhone?: string;
  whatsappNumber?: string;
  
  // Social links
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  
  // Legal
  termsUrl: string;
  privacyUrl: string;
  
  // Other
  defaultCurrency: string;
  defaultLanguage: string;
}

export interface HomeFeedData {
  banners: {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    actionType: string;
    actionValue: string;
  }[];
  featuredTours: {
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
    company: {
      id: string;
      name: string;
    };
  }[];
  featuredRegions: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    tourCount: number;
  }[];
  recentlyViewed?: {
    id: string;
    title: string;
    coverImage?: string;
    price: number;
    currency: string;
  }[];
  recommendations?: {
    id: string;
    title: string;
    coverImage?: string;
    price: number;
    currency: string;
    matchReason: string;  // "Porque te gustó X", "Popular en tu zona"
  }[];
}

// ============ SERVICE ============

export const appConfigService = {
  /**
   * Get app configuration (call on app startup)
   * GET /api/app/config
   */
  async getConfig(): Promise<ApiResponse<AppConfig>> {
    const response = await api.get<ApiResponse<AppConfig>>('/app/config');
    return response.data;
  },

  /**
   * Get home feed data (single endpoint for Home screen)
   * GET /api/home
   */
  async getHomeFeed(): Promise<ApiResponse<HomeFeedData>> {
    const response = await api.get<ApiResponse<HomeFeedData>>('/home');
    return response.data;
  },

  /**
   * Check if app needs update
   * GET /api/app/check-version?version=1.0.0
   */
  async checkVersion(currentVersion: string): Promise<{
    needsUpdate: boolean;
    forceUpdate: boolean;
    latestVersion: string;
    updateUrl?: string;
  }> {
    const response = await api.get<{
      success: boolean;
      data: {
        needsUpdate: boolean;
        forceUpdate: boolean;
        latestVersion: string;
        updateUrl?: string;
      };
    }>('/app/check-version', {
      params: { version: currentVersion },
    });
    return response.data.data;
  },

  /**
   * Report app error (for crash reporting)
   * POST /api/app/report-error
   */
  async reportError(error: {
    message: string;
    stack?: string;
    screen?: string;
    userId?: string;
    deviceInfo?: object;
  }): Promise<void> {
    await api.post('/app/report-error', error);
  },

  /**
   * Get FAQ/Help content
   * GET /api/app/faq
   */
  async getFAQ(): Promise<ApiResponse<{
    categories: {
      id: string;
      title: string;
      questions: {
        id: string;
        question: string;
        answer: string;
      }[];
    }[];
  }>> {
    const response = await api.get('/app/faq');
    return response.data;
  },
};

