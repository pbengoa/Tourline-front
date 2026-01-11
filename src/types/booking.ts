/**
 * Booking system types
 */

export type BookingStatus =
  | 'pending' // Waiting for guide confirmation
  | 'confirmed' // Guide confirmed the booking
  | 'completed' // Tour has been completed
  | 'cancelled' // Booking was cancelled
  | 'rejected'; // Guide rejected the booking

export interface TimeSlot {
  id: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  available: boolean;
}

export interface BookingRequest {
  tourId?: string;
  guideId: string;
  date: string; // YYYY-MM-DD format
  timeSlot: TimeSlot;
  participants: number;
  message?: string;
  totalPrice: number;
}

export interface Booking {
  id: string;

  // Tour/Guide info
  tourId?: string;
  tourTitle?: string;
  guideId: string;
  guideName: string;
  guideAvatar?: string;
  location: string;

  // Booking details
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  participants: number;

  // Pricing
  pricePerPerson: number;
  totalPrice: number;
  currency: string;

  // Status
  status: BookingStatus;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  // User message
  userMessage?: string;
  guideResponse?: string;
}

export interface BookingDay {
  date: string; // YYYY-MM-DD
  available: boolean;
  slots: TimeSlot[];
}

export const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  {
    label: string;
    color: string;
    icon: string;
  }
> = {
  pending: {
    label: 'Pendiente',
    color: '#F59E0B',
    icon: '⏳',
  },
  confirmed: {
    label: 'Confirmada',
    color: '#10B981',
    icon: '✓',
  },
  completed: {
    label: 'Completada',
    color: '#6366F1',
    icon: '✓',
  },
  cancelled: {
    label: 'Cancelada',
    color: '#EF4444',
    icon: '✕',
  },
  rejected: {
    label: 'Rechazada',
    color: '#EF4444',
    icon: '✕',
  },
};
