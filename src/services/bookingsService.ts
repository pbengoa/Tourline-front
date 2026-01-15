import { api, ApiResponse } from './api';

// ============ TYPES ============

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED_USER'
  | 'CANCELLED_COMPANY'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'REFUNDED';

// Company info in booking
export interface BookingCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

// Tour info in booking
export interface BookingTour {
  id: string;
  name: string;
  slug: string;
  coverImage?: string;
  duration: number;
  price: number;
  currency: string;
  meetingPoint?: string;
  meetingPointInstructions?: string;
  city?: string;
  country?: string;
  company: BookingCompany;
}

// Assigned guide (optional)
export interface AssignedGuide {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
}

// Main Booking interface (NEW - Tour-centric)
export interface Booking {
  id: string;
  reference: string;
  tourId: string;              // ⚠️ CHANGED from guideId
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  participants: number;        // ⚠️ CHANGED from groupSize
  specialRequests?: string;
  userPhone?: string;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  notes?: string;              // ⚠️ CHANGED from guideNotes
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  tour?: BookingTour;
  assignedGuide?: AssignedGuide;
}

// ============ REQUEST TYPES ============

// Create booking request (NEW)
export interface CreateBookingRequest {
  tourId: string;              // ⚠️ CHANGED from guideId
  date: string;                // YYYY-MM-DD
  startTime: string;           // HH:MM
  participants: number;        // ⚠️ CHANGED from groupSize
  specialRequests?: string;
  userPhone?: string;
}

export interface UpdateBookingRequest {
  participants?: number;
  specialRequests?: string;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface ConfirmBookingRequest {
  notes?: string;
  assignedGuideId?: string;
}

// ============ CALENDAR TYPES (NEW) ============

export interface TourCalendarSlot {
  id: string;
  startTime: string;
  endTime: string;
  spotsAvailable: number;
  spotsBooked: number;
  price: number;
}

export interface TourCalendarDay {
  date: string;
  dayOfWeek: string;
  isAvailable: boolean;
  slots: TourCalendarSlot[];
}

export interface TourCalendarResponse {
  tourId: string;
  tourName: string;
  month: number;
  year: number;
  days: TourCalendarDay[];
}

// ============ STATS & QUERY TYPES ============

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export interface BookingQueryParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'date' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// ============ BOOKINGS SERVICE ============

export const bookingsService = {
  // ============ USER BOOKING METHODS ============

  /**
   * Create a new booking for a tour
   */
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      '/bookings',
      data
    );
    return response.data.data.booking;
  },

  /**
   * Get current user's bookings
   */
  async getMyBookings(params?: BookingQueryParams): Promise<{ data: Booking[]; total: number }> {
    const response = await api.get<{
      success: boolean;
      data: Booking[];
      meta: { total: number };
    }>('/bookings', { params });
    return { data: response.data.data, total: response.data.meta?.total || 0 };
  },

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    const response = await api.get<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}`
    );
    return response.data.data.booking;
  },

  /**
   * Get booking by reference code
   */
  async getBookingByReference(ref: string): Promise<Booking> {
    const response = await api.get<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/reference/${ref}`
    );
    return response.data.data.booking;
  },

  /**
   * Update booking details
   */
  async updateBooking(id: string, data: UpdateBookingRequest): Promise<Booking> {
    const response = await api.patch<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}`,
      data
    );
    return response.data.data.booking;
  },

  /**
   * Cancel booking (user)
   */
  async cancelBooking(id: string, data?: CancelBookingRequest): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}/cancel`,
      data || {}
    );
    return response.data.data.booking;
  },

  // ============ TOUR CALENDAR METHODS (NEW) ============

  /**
   * Get tour availability calendar
   * NEW endpoint: GET /api/bookings/tour/:tourId/calendar
   */
  async getTourCalendar(tourId: string, year: number, month: number): Promise<TourCalendarResponse> {
    const response = await api.get<{ success: boolean; data: TourCalendarResponse }>(
      `/bookings/tour/${tourId}/calendar`,
      { params: { year, month } }
    );
    return response.data.data;
  },

  // ============ COMPANY/ADMIN METHODS (NEW) ============

  /**
   * Get company's bookings list
   */
  async getCompanyBookings(params?: BookingQueryParams): Promise<{ data: Booking[]; total: number }> {
    const response = await api.get<{
      success: boolean;
      data: Booking[];
      meta: { total: number };
    }>('/bookings/company/list', { params });
    return { data: response.data.data, total: response.data.meta?.total || 0 };
  },

  /**
   * Get upcoming bookings for company
   */
  async getCompanyUpcoming(): Promise<Booking[]> {
    const response = await api.get<{ success: boolean; data: Booking[] }>(
      '/bookings/company/upcoming'
    );
    return response.data.data;
  },

  /**
   * Get company booking statistics
   */
  async getCompanyStats(): Promise<BookingStats> {
    const response = await api.get<{ success: boolean; data: BookingStats }>(
      '/bookings/company/stats'
    );
    return response.data.data;
  },

  /**
   * Confirm booking (company/admin)
   */
  async confirmBooking(id: string, data?: ConfirmBookingRequest): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}/confirm`,
      data || {}
    );
    return response.data.data.booking;
  },

  /**
   * Reject booking (company/admin)
   */
  async rejectBooking(id: string, data?: CancelBookingRequest): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}/reject`,
      data || {}
    );
    return response.data.data.booking;
  },

  /**
   * Mark booking as completed
   */
  async completeBooking(id: string): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}/complete`
    );
    return response.data.data.booking;
  },

  /**
   * Mark booking as no-show
   */
  async markNoShow(id: string): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}/no-show`
    );
    return response.data.data.booking;
  },
};
