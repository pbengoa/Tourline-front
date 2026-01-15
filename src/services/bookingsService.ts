import { api, ApiResponse } from './api';

// Types
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED_USER'
  | 'CANCELLED_GUIDE'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'REFUNDED';

export interface BookingGuide {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  pricePerHour: number;
  currency: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface Booking {
  id: string;
  reference: string;
  guideId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  tourType?: string;
  groupSize: number;
  meetingPoint?: string;
  specialRequests?: string;
  userPhone?: string;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  guideNotes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  guide?: BookingGuide;
}

export interface CreateBookingRequest {
  guideId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  tourType?: string;
  groupSize?: number;
  meetingPoint?: string;
  specialRequests?: string;
  userPhone?: string;
}

export interface MultiDayBookingRequest {
  guideId: string;
  dates: {
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
  }[];
  tourType?: string;
  groupSize?: number;
  meetingPoint?: string;
  specialRequests?: string;
  userPhone?: string;
}

export interface UpdateBookingRequest {
  tourType?: string;
  groupSize?: number;
  meetingPoint?: string;
  specialRequests?: string;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface ConfirmBookingRequest {
  guideNotes?: string;
  meetingPoint?: string;
}

export interface AvailabilitySlot {
  id: string;
  guideId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isBlocked: boolean;
  isRecurring: boolean;
  createdAt: string;
}

export interface CalendarDay {
  date: string;
  dayOfWeek: string;
  isAvailable: boolean;
  slots: {
    id: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    isBlocked: boolean;
  }[];
}

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

export interface AvailabilityQueryParams {
  fromDate: string;
  toDate: string;
  includeBooked?: boolean;
}

export interface CreateAvailabilityRequest {
  date: string;
  startTime: string;
  endTime: string;
  isRecurring?: boolean;
  recurringDays?: string[];
}

export interface RecurringAvailabilityRequest {
  startDate: string;
  endDate: string;
  days: string[]; // ['monday', 'tuesday', etc.]
  startTime: string;
  endTime: string;
}

// Bookings Service
export const bookingsService = {
  // ============ USER BOOKING METHODS ============

  // Create a new booking
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      '/bookings',
      data
    );
    return response.data.data.booking;
  },

  // Create multi-day booking (creates multiple bookings)
  async createMultiDayBooking(data: MultiDayBookingRequest): Promise<Booking[]> {
    const bookings: Booking[] = [];
    for (const dateSlot of data.dates) {
      const booking = await bookingsService.createBooking({
        guideId: data.guideId,
        date: dateSlot.date,
        startTime: dateSlot.startTime,
        endTime: dateSlot.endTime,
        tourType: data.tourType,
        groupSize: data.groupSize,
        meetingPoint: data.meetingPoint,
        specialRequests: data.specialRequests,
        userPhone: data.userPhone,
      });
      bookings.push(booking);
    }
    return bookings;
  },

  // Get my bookings
  async getMyBookings(params?: BookingQueryParams): Promise<{ data: Booking[]; total: number }> {
    const response = await api.get<{
      success: boolean;
      data: Booking[];
      meta: { total: number };
    }>('/bookings', { params });
    return { data: response.data.data, total: response.data.meta.total };
  },

  // Get booking by ID
  async getBookingById(id: string): Promise<Booking> {
    const response = await api.get<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}`
    );
    return response.data.data.booking;
  },

  // Get booking by reference
  async getBookingByReference(ref: string): Promise<Booking> {
    const response = await api.get<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/reference/${ref}`
    );
    return response.data.data.booking;
  },

  // Update booking
  async updateBooking(id: string, data: UpdateBookingRequest): Promise<Booking> {
    const response = await api.patch<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}`,
      data
    );
    return response.data.data.booking;
  },

  // Cancel booking (user)
  async cancelBooking(id: string, data?: CancelBookingRequest): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}/cancel`,
      data || {}
    );
    return response.data.data.booking;
  },

  // ============ GUIDE BOOKING METHODS ============

  // Get guide's bookings
  async getGuideBookings(params?: BookingQueryParams): Promise<{ data: Booking[]; total: number }> {
    const response = await api.get<{
      success: boolean;
      data: Booking[];
      meta: { total: number };
    }>('/bookings/guide/list', { params });
    return { data: response.data.data, total: response.data.meta.total };
  },

  // Get upcoming bookings for guide
  async getUpcomingBookings(): Promise<Booking[]> {
    const response = await api.get<{ success: boolean; data: Booking[] }>(
      '/bookings/guide/upcoming'
    );
    return response.data.data;
  },

  // Get guide booking stats
  async getGuideStats(): Promise<BookingStats> {
    const response = await api.get<{ success: boolean; data: BookingStats }>(
      '/bookings/guide/stats'
    );
    return response.data.data;
  },

  // Confirm booking (guide)
  async confirmBooking(id: string, data?: ConfirmBookingRequest): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}/confirm`,
      data || {}
    );
    return response.data.data.booking;
  },

  // Reject booking (guide)
  async rejectBooking(id: string, data?: CancelBookingRequest): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}/reject`,
      data || {}
    );
    return response.data.data.booking;
  },

  // Mark as completed (guide)
  async completeBooking(id: string): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}/complete`
    );
    return response.data.data.booking;
  },

  // Mark as no-show (guide)
  async markNoShow(id: string): Promise<Booking> {
    const response = await api.post<{ success: boolean; data: { booking: Booking } }>(
      `/bookings/${id}/no-show`
    );
    return response.data.data.booking;
  },

  // ============ AVAILABILITY METHODS ============

  // Get guide availability
  async getGuideAvailability(
    guideId: string,
    params: AvailabilityQueryParams
  ): Promise<AvailabilitySlot[]> {
    const response = await api.get<{ success: boolean; data: AvailabilitySlot[] }>(
      `/bookings/availability/${guideId}`,
      { params }
    );
    return response.data.data;
  },

  // Get guide calendar view
  async getGuideCalendar(guideId: string, year: number, month: number): Promise<CalendarDay[]> {
    const response = await api.get<{ success: boolean; data: CalendarDay[] }>(
      `/bookings/availability/${guideId}/calendar`,
      { params: { year, month } }
    );
    return response.data.data;
  },

  // Create availability slot (guide)
  async createAvailability(data: CreateAvailabilityRequest): Promise<AvailabilitySlot> {
    const response = await api.post<{ success: boolean; data: { slot: AvailabilitySlot } }>(
      '/bookings/availability',
      data
    );
    return response.data.data.slot;
  },

  // Create bulk availability slots (guide)
  async createBulkAvailability(slots: CreateAvailabilityRequest[]): Promise<AvailabilitySlot[]> {
    const response = await api.post<{ success: boolean; data: { slots: AvailabilitySlot[] } }>(
      '/bookings/availability/bulk',
      { slots }
    );
    return response.data.data.slots;
  },

  // Generate recurring availability (guide)
  async createRecurringAvailability(
    data: RecurringAvailabilityRequest
  ): Promise<AvailabilitySlot[]> {
    const response = await api.post<{ success: boolean; data: { slots: AvailabilitySlot[] } }>(
      '/bookings/availability/recurring',
      data
    );
    return response.data.data.slots;
  },

  // Block availability slot (guide)
  async blockSlot(slotId: string): Promise<void> {
    await api.post(`/bookings/availability/${slotId}/block`);
  },

  // Unblock availability slot (guide)
  async unblockSlot(slotId: string): Promise<void> {
    await api.post(`/bookings/availability/${slotId}/unblock`);
  },

  // Delete availability slot (guide)
  async deleteAvailability(slotId: string): Promise<void> {
    await api.delete(`/bookings/availability/${slotId}`);
  },
};
