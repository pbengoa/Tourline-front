import { api, ApiResponse } from './api';
import { Company } from './authService';

// ============ Types ============

export type TourStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type GuideStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED';
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED_USER'
  | 'CANCELLED_COMPANY'
  | 'NO_SHOW'
  | 'REFUNDED';

export interface AdminTour {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  image?: string;
  images?: string[];
  price: number;
  currency: string;
  duration: number;
  durationFormatted?: string;
  maxParticipants: number;
  minParticipants?: number;
  location: string;
  meetingPointAddress?: string;
  coordinates?: { latitude: number; longitude: number };
  categories: string[];
  includes: string[];
  excludes?: string[];
  requirements?: string;
  status: TourStatus;
  isFeatured: boolean;
  featured?: boolean; // Backwards compatibility
  rating: number;
  reviewCount: number;
  bookingsCount: number;
  guides: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
  }[];
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface AdminGuide {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location: string;
  languages: string[];
  specialties: string[];
  bio?: string;
  pricePerHour: number;
  currency: string;
  rating: number;
  reviewCount: number;
  toursCount: number;
  bookingsCount: number;
  isVerified: boolean;
  isActive: boolean;
  status: GuideStatus;
  createdAt: string;
}

export interface AdminBooking {
  id: string;
  reference: string;
  tour: {
    id: string;
    title: string;
    image?: string;
  };
  guide?: {
    id: string;
    name: string;
    avatar?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  groupSize?: number; // Backwards compatibility
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalTours: number;
  activeTours: number;
  totalGuides: number;
  activeGuides: number;
  totalBookings: number;
  pendingBookings: number;
  monthlyRevenue: number;
  averageRating: number;
}

export interface DashboardData {
  company: {
    id: string;
    name: string;
    logo?: string;
    logoUrl?: string;
  };
  stats: DashboardStats;
  recentBookings: AdminBooking[];
  alerts: {
    type: string;
    count: number;
    message: string;
  }[];
}

export interface BookingStats {
  today: { bookings: number; revenue: number };
  thisWeek: { bookings: number; revenue: number };
  thisMonth: { bookings: number; revenue: number };
  byStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled_user: number;
    cancelled_company: number;
  };
  topTours: { id: string; title: string; image?: string; bookings: number; revenue: number }[];
  topGuides: { id: string; name: string; avatar?: string; bookings: number; revenue: number }[];
}

export interface TimeSlot {
  startTime: string;
  maxBookings?: number;
}

export interface TourAvailability {
  daysOfWeek: number[];
  timeSlots: TimeSlot[];
  isRecurring?: boolean;
  specificDates?: string[];
  blackoutDates?: string[];
}

export interface CreateTourRequest {
  title: string;
  description: string;
  shortDescription?: string;
  image?: string;
  images?: string[];
  price: number;
  currency: string;
  duration: number;
  maxParticipants: number;
  minParticipants?: number;
  location: string;
  meetingPointAddress?: string;
  coordinates?: { latitude: number; longitude: number };
  categories: string[];
  includes: string[];
  excludes?: string[];
  requirements?: string;
  guideIds?: string[];
  status?: TourStatus;
  availability?: TourAvailability;
}

export interface CreateGuideRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location: string;
  languages: string[];
  specialties: string[];
  bio?: string;
  pricePerHour: number;
  currency?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============ Service Functions ============

export const adminService = {
  // ============ Dashboard ============
  async getDashboard(): Promise<DashboardData> {
    try {
      console.log('📊 Fetching admin dashboard...');
      const response = await api.get<ApiResponse<DashboardData>>('/admin/dashboard');
      console.log('✅ Dashboard loaded:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error fetching dashboard:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);
      throw error;
    }
  },

  // ============ Tours ============
  async getTours(params?: {
    page?: number;
    limit?: number;
    status?: TourStatus;
    search?: string;
  }): Promise<{ data: AdminTour[]; total: number }> {
    try {
      const response = await api.get<PaginatedResponse<AdminTour>>('/admin/tours', { params });
      return {
        data: response.data.data,
        total: response.data.meta.total,
      };
    } catch (error) {
      console.error('Error fetching tours:', error);
      throw error;
    }
  },

  async getTourById(id: string): Promise<AdminTour | null> {
    try {
      const response = await api.get<ApiResponse<AdminTour>>(`/admin/tours/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tour:', error);
      return null;
    }
  },

  async createTour(data: CreateTourRequest): Promise<AdminTour> {
    try {
      const response = await api.post<ApiResponse<AdminTour>>('/admin/tours', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating tour:', error);
      throw error;
    }
  },

  async updateTour(id: string, data: Partial<CreateTourRequest>): Promise<AdminTour | null> {
    try {
      const response = await api.put<ApiResponse<AdminTour>>(`/admin/tours/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating tour:', error);
      throw error;
    }
  },

  async deleteTour(id: string): Promise<boolean> {
    try {
      await api.delete(`/admin/tours/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting tour:', error);
      return false;
    }
  },

  async publishTour(id: string): Promise<AdminTour | null> {
    try {
      const response = await api.post<ApiResponse<AdminTour>>(`/admin/tours/${id}/publish`);
      return response.data.data;
    } catch (error) {
      console.error('Error publishing tour:', error);
      throw error;
    }
  },

  async unpublishTour(id: string): Promise<AdminTour | null> {
    try {
      const response = await api.post<ApiResponse<AdminTour>>(`/admin/tours/${id}/unpublish`);
      return response.data.data;
    } catch (error) {
      console.error('Error unpublishing tour:', error);
      throw error;
    }
  },

  // ============ Guides ============
  async getGuides(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ data: AdminGuide[]; total: number }> {
    try {
      const response = await api.get<PaginatedResponse<AdminGuide>>('/admin/guides', { params });
      return {
        data: response.data.data,
        total: response.data.meta.total,
      };
    } catch (error) {
      console.error('Error fetching guides:', error);
      throw error;
    }
  },

  async getGuideById(id: string): Promise<AdminGuide | null> {
    try {
      const response = await api.get<ApiResponse<AdminGuide>>(`/admin/guides/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching guide:', error);
      return null;
    }
  },

  async createGuide(data: CreateGuideRequest): Promise<AdminGuide> {
    try {
      const response = await api.post<ApiResponse<AdminGuide>>('/admin/guides', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating guide:', error);
      throw error;
    }
  },

  async updateGuide(id: string, data: Partial<CreateGuideRequest>): Promise<AdminGuide | null> {
    try {
      const response = await api.put<ApiResponse<AdminGuide>>(`/admin/guides/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating guide:', error);
      throw error;
    }
  },

  async deleteGuide(id: string): Promise<boolean> {
    try {
      await api.delete(`/admin/guides/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting guide:', error);
      return false;
    }
  },

  async verifyGuide(id: string): Promise<AdminGuide | null> {
    try {
      const response = await api.post<ApiResponse<AdminGuide>>(`/admin/guides/${id}/verify`);
      return response.data.data;
    } catch (error) {
      console.error('Error verifying guide:', error);
      throw error;
    }
  },

  async activateGuide(id: string): Promise<AdminGuide | null> {
    try {
      const response = await api.post<ApiResponse<AdminGuide>>(`/admin/guides/${id}/activate`);
      return response.data.data;
    } catch (error) {
      console.error('Error activating guide:', error);
      throw error;
    }
  },

  async deactivateGuide(id: string): Promise<AdminGuide | null> {
    try {
      const response = await api.post<ApiResponse<AdminGuide>>(`/admin/guides/${id}/deactivate`);
      return response.data.data;
    } catch (error) {
      console.error('Error deactivating guide:', error);
      throw error;
    }
  },

  async inviteGuide(data: CreateGuideRequest): Promise<AdminGuide> {
    try {
      const response = await api.post<ApiResponse<AdminGuide>>('/admin/guides/invite', data);
      return response.data.data;
    } catch (error) {
      console.error('Error inviting guide:', error);
      throw error;
    }
  },

  // ============ Bookings ============
  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    guideId?: string;
    tourId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ data: AdminBooking[]; total: number }> {
    try {
      const response = await api.get<PaginatedResponse<AdminBooking>>('/admin/bookings', {
        params,
      });
      return {
        data: response.data.data,
        total: response.data.meta.total,
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  async getBookingById(id: string): Promise<AdminBooking | null> {
    try {
      const response = await api.get<ApiResponse<AdminBooking>>(`/admin/bookings/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
  },

  async getBookingStats(): Promise<BookingStats> {
    try {
      const response = await api.get<ApiResponse<BookingStats>>('/admin/bookings/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }
  },

  async confirmBooking(id: string): Promise<AdminBooking> {
    try {
      const response = await api.patch<ApiResponse<AdminBooking>>(`/admin/bookings/${id}/confirm`);
      return response.data.data;
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  },

  async cancelBooking(id: string, reason?: string): Promise<AdminBooking> {
    try {
      const response = await api.patch<ApiResponse<AdminBooking>>(`/admin/bookings/${id}/cancel`, {
        reason,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },

  async completeBooking(id: string): Promise<AdminBooking> {
    try {
      const response = await api.patch<ApiResponse<AdminBooking>>(`/admin/bookings/${id}/complete`);
      return response.data.data;
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  },

  // ============ Company ============
  async getCompany(): Promise<Company> {
    try {
      const response = await api.get<ApiResponse<Company>>('/admin/company');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  },

  async updateCompany(data: Partial<Company>): Promise<Company> {
    try {
      const response = await api.put<ApiResponse<Company>>('/admin/company', data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },
};
