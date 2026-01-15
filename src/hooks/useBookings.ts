import { useState, useEffect, useCallback } from 'react';
import {
  bookingsService,
  Booking,
  Availability,
  MonthAvailability,
  CreateBookingRequest,
  getErrorMessage,
} from '../services';

interface UseBookingsResult {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseBookingResult {
  booking: Booking | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseAvailabilityResult {
  availability: Availability[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMonthAvailabilityResult {
  availability: MonthAvailability[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseCreateBookingResult {
  createBooking: (data: CreateBookingRequest) => Promise<Booking | null>;
  loading: boolean;
  error: string | null;
}

// Hook to get my bookings (as visitor)
export const useMyBookings = (): UseBookingsResult => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingsService.getMyBookings();
      if (response.success) {
        setBookings(response.data);
      } else {
        setError('Error al cargar reservas');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings };
};

// Hook to get a single booking by ID
export const useBooking = (bookingId: string): UseBookingResult => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await bookingsService.getBooking(bookingId);
      if (response.success) {
        setBooking(response.data);
      } else {
        setError('Error al cargar reserva');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  return { booking, loading, error, refetch: fetchBooking };
};

// Hook to get guide availability
export const useGuideAvailability = (guideId: string): UseAvailabilityResult => {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!guideId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await bookingsService.getGuideAvailability(guideId);
      if (response.success) {
        setAvailability(response.data);
      } else {
        setError('Error al cargar disponibilidad');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return { availability, loading, error, refetch: fetchAvailability };
};

// Hook to get guide monthly availability
export const useGuideMonthAvailability = (
  guideId: string,
  month: string
): UseMonthAvailabilityResult => {
  const [availability, setAvailability] = useState<MonthAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!guideId || !month) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await bookingsService.getGuideMonthlyAvailability(guideId, month);
      if (response.success) {
        setAvailability(response.data);
      } else {
        setError('Error al cargar disponibilidad');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [guideId, month]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return { availability, loading, error, refetch: fetchAvailability };
};

// Hook to create a booking
export const useCreateBooking = (): UseCreateBookingResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (data: CreateBookingRequest): Promise<Booking | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingsService.createBooking(data);
      if (response.success) {
        return response.data;
      } else {
        setError('Error al crear reserva');
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createBooking, loading, error };
};

