import { api } from './api';
import type { ApiResponse } from './api';

/**
 * Company/Organization interfaces
 */
export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImage?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  rating: number;
  reviewCount: number;
  tourCount: number;
  yearsActive?: number;
  certifications?: string[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  operatingHours?: Record<string, string>;
  isVerified: boolean;
  createdAt: string;
}

export interface CompanyTour {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  price: number;
  currency: string;
  duration: number;
  rating: number;
  reviewCount: number;
  city: string;
  featured: boolean;
}

export interface CompanyReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  tourId: string;
  tourTitle: string;
  rating: number;
  comment: string;
  response?: string;
  responseAt?: string;
  images?: string[];
  createdAt: string;
}

export interface CompanyGuide {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  specialties: string[];
  languages: string[];
  tourCount: number;
}

export interface SearchCompaniesParams {
  query?: string;
  city?: string;
  category?: string;
  minRating?: number;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'tourCount' | 'reviewCount' | 'name';
}

export interface CompaniesListResponse {
  companies: Company[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Companies Service
 */
export const companiesService = {
  /**
   * Search companies with filters
   */
  async searchCompanies(params: SearchCompaniesParams = {}): Promise<ApiResponse<CompaniesListResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.query) queryParams.append('q', params.query);
      if (params.city) queryParams.append('city', params.city);
      if (params.category) queryParams.append('category', params.category);
      if (params.minRating) queryParams.append('minRating', params.minRating.toString());
      if (params.verified !== undefined) queryParams.append('verified', params.verified.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);

      const url = `/companies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await api.get<CompaniesListResponse>(url);
    } catch (error) {
      console.error('Error searching companies:', error);
      return { success: false, error: 'Failed to search companies' };
    }
  },

  /**
   * Get featured companies
   */
  async getFeaturedCompanies(): Promise<ApiResponse<Company[]>> {
    try {
      return await api.get<Company[]>('/companies/featured');
    } catch (error) {
      console.error('Error fetching featured companies:', error);
      return { success: false, error: 'Failed to fetch featured companies' };
    }
  },

  /**
   * Get company by ID or slug
   */
  async getCompany(idOrSlug: string): Promise<ApiResponse<Company>> {
    try {
      return await api.get<Company>(`/companies/${idOrSlug}`);
    } catch (error) {
      console.error('Error fetching company:', error);
      return { success: false, error: 'Failed to fetch company' };
    }
  },

  /**
   * Get company's tours
   */
  async getCompanyTours(
    companyId: string,
    params: { page?: number; limit?: number; category?: string; featured?: boolean } = {}
  ): Promise<ApiResponse<{ tours: CompanyTour[]; total: number }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());

      const url = `/companies/${companyId}/tours${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await api.get<{ tours: CompanyTour[]; total: number }>(url);
    } catch (error) {
      console.error('Error fetching company tours:', error);
      return { success: false, error: 'Failed to fetch company tours' };
    }
  },

  /**
   * Get company's reviews
   */
  async getCompanyReviews(
    companyId: string,
    params: { page?: number; limit?: number; rating?: number } = {}
  ): Promise<ApiResponse<{ reviews: CompanyReview[]; total: number; averageRating: number; distribution: Record<string, number> }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.rating) queryParams.append('rating', params.rating.toString());

      const url = `/companies/${companyId}/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await api.get<{ reviews: CompanyReview[]; total: number; averageRating: number; distribution: Record<string, number> }>(url);
    } catch (error) {
      console.error('Error fetching company reviews:', error);
      return { success: false, error: 'Failed to fetch company reviews' };
    }
  },

  /**
   * Get company's certified guides
   */
  async getCompanyGuides(companyId: string): Promise<ApiResponse<CompanyGuide[]>> {
    try {
      return await api.get<CompanyGuide[]>(`/companies/${companyId}/guides`);
    } catch (error) {
      console.error('Error fetching company guides:', error);
      return { success: false, error: 'Failed to fetch company guides' };
    }
  },
};

export default companiesService;

