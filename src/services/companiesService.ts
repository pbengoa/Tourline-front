import { api } from './api';

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

// Service response type
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Transform backend company to frontend format
 */
function transformCompany(c: any): Company {
  return {
    ...c,
    tourCount: c._count?.tours || c.tourCount || 0,
    reviewCount: c._count?.reviews || c.totalReviews || c.reviewCount || 0,
    rating: parseFloat(c.averageRating) || c.rating || 0,
    isVerified: c.status === 'VERIFIED' || c.isVerified || false,
  };
}

/**
 * Companies Service
 */
export const companiesService = {
  /**
   * Search companies with filters
   */
  async searchCompanies(
    params: SearchCompaniesParams = {}
  ): Promise<ServiceResponse<CompaniesListResponse>> {
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
      const axiosResponse = await api.get(url);
      const backend = axiosResponse.data;

      if (backend.success && Array.isArray(backend.data)) {
        const companies = backend.data.map(transformCompany);
        console.log('📦 Companies loaded:', companies.length);

        return {
          success: true,
          data: {
            companies,
            total: backend.pagination?.total || companies.length,
            page: backend.pagination?.page || 1,
            totalPages: backend.pagination?.totalPages || 1,
          },
        };
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      console.error('Error searching companies:', error);
      return { success: false, error: 'Failed to search companies' };
    }
  },

  /**
   * Get featured companies
   */
  async getFeaturedCompanies(): Promise<ServiceResponse<Company[]>> {
    try {
      const axiosResponse = await api.get('/companies/featured');
      const backend = axiosResponse.data;

      if (backend.success && Array.isArray(backend.data)) {
        return { success: true, data: backend.data.map(transformCompany) };
      }
      return { success: false, error: 'Invalid response' };
    } catch (error) {
      console.error('Error fetching featured companies:', error);
      return { success: false, error: 'Failed to fetch featured companies' };
    }
  },

  /**
   * Get company by ID or slug
   */
  async getCompany(idOrSlug: string): Promise<ServiceResponse<Company>> {
    try {
      const axiosResponse = await api.get(`/companies/${idOrSlug}`);
      const backend = axiosResponse.data;

      if (backend.success && backend.data) {
        return { success: true, data: transformCompany(backend.data) };
      }
      return { success: false, error: 'Company not found' };
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
  ): Promise<ServiceResponse<{ tours: CompanyTour[]; total: number }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());

      const url = `/companies/${companyId}/tours${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const axiosResponse = await api.get(url);
      const backend = axiosResponse.data;

      if (backend.success) {
        const tours = Array.isArray(backend.data) ? backend.data : [];
        return {
          success: true,
          data: {
            tours,
            total: backend.pagination?.total || tours.length,
          },
        };
      }
      return { success: false, error: 'Failed to fetch tours' };
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
  ): Promise<
    ServiceResponse<{
      reviews: CompanyReview[];
      total: number;
      averageRating: number;
      distribution: Record<string, number>;
    }>
  > {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.rating) queryParams.append('rating', params.rating.toString());

      const url = `/companies/${companyId}/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const axiosResponse = await api.get(url);
      const backend = axiosResponse.data;

      if (backend.success) {
        const reviews = Array.isArray(backend.data) ? backend.data : [];
        return {
          success: true,
          data: {
            reviews,
            total: backend.pagination?.total || reviews.length,
            averageRating: backend.averageRating || 0,
            distribution: backend.distribution || {},
          },
        };
      }
      return { success: false, error: 'Failed to fetch reviews' };
    } catch (error) {
      console.error('Error fetching company reviews:', error);
      return { success: false, error: 'Failed to fetch company reviews' };
    }
  },

  /**
   * Get company's certified guides
   */
  async getCompanyGuides(companyId: string): Promise<ServiceResponse<CompanyGuide[]>> {
    try {
      const axiosResponse = await api.get(`/companies/${companyId}/guides`);
      const backend = axiosResponse.data;

      if (backend.success && Array.isArray(backend.data)) {
        return { success: true, data: backend.data };
      }
      return { success: false, error: 'Failed to fetch guides' };
    } catch (error) {
      console.error('Error fetching company guides:', error);
      return { success: false, error: 'Failed to fetch company guides' };
    }
  },
};

export default companiesService;
