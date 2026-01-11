import {
  MOCK_BOOKINGS,
  AVAILABLE_DAYS,
  generateTimeSlots,
  generateAvailableDays,
} from '../../constants/bookingData';
import { BOOKING_STATUS_CONFIG } from '../../types/booking';

describe('Booking Data', () => {
  describe('MOCK_BOOKINGS', () => {
    it('should have at least one booking', () => {
      expect(MOCK_BOOKINGS.length).toBeGreaterThan(0);
    });

    it('should have bookings with required properties', () => {
      MOCK_BOOKINGS.forEach((booking) => {
        expect(booking).toHaveProperty('id');
        expect(booking).toHaveProperty('guideId');
        expect(booking).toHaveProperty('guideName');
        expect(booking).toHaveProperty('date');
        expect(booking).toHaveProperty('startTime');
        expect(booking).toHaveProperty('endTime');
        expect(booking).toHaveProperty('participants');
        expect(booking).toHaveProperty('totalPrice');
        expect(booking).toHaveProperty('status');
      });
    });

    it('should have valid booking statuses', () => {
      const validStatuses = Object.keys(BOOKING_STATUS_CONFIG);
      MOCK_BOOKINGS.forEach((booking) => {
        expect(validStatuses).toContain(booking.status);
      });
    });

    it('should have bookings with positive prices', () => {
      MOCK_BOOKINGS.forEach((booking) => {
        expect(booking.totalPrice).toBeGreaterThan(0);
        expect(booking.pricePerPerson).toBeGreaterThan(0);
      });
    });

    it('should have bookings with at least 1 participant', () => {
      MOCK_BOOKINGS.forEach((booking) => {
        expect(booking.participants).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('AVAILABLE_DAYS', () => {
    it('should have days for the next 30 days', () => {
      expect(AVAILABLE_DAYS.length).toBe(30);
    });

    it('should have days with date and available properties', () => {
      AVAILABLE_DAYS.forEach((day) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('available');
        expect(day).toHaveProperty('slots');
      });
    });

    it('should have valid date format (YYYY-MM-DD)', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      AVAILABLE_DAYS.forEach((day) => {
        expect(day.date).toMatch(dateRegex);
      });
    });
  });

  describe('generateTimeSlots', () => {
    it('should return an array of time slots', () => {
      const slots = generateTimeSlots();
      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBeGreaterThan(0);
    });

    it('should have slots with id, startTime, endTime, and available', () => {
      const slots = generateTimeSlots();
      slots.forEach((slot) => {
        expect(slot).toHaveProperty('id');
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
        expect(slot).toHaveProperty('available');
      });
    });

    it('should have valid time format (HH:mm)', () => {
      const timeRegex = /^\d{2}:\d{2}$/;
      const slots = generateTimeSlots();
      slots.forEach((slot) => {
        expect(slot.startTime).toMatch(timeRegex);
        expect(slot.endTime).toMatch(timeRegex);
      });
    });
  });

  describe('generateAvailableDays', () => {
    it('should return an array of 30 days', () => {
      const days = generateAvailableDays();
      expect(days.length).toBe(30);
    });

    it('should have days with required properties', () => {
      const days = generateAvailableDays();
      days.forEach((day) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('available');
        expect(day).toHaveProperty('slots');
      });
    });

    it('should generate future dates', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const days = generateAvailableDays();
      days.forEach((day) => {
        const dayDate = new Date(day.date);
        expect(dayDate.getTime()).toBeGreaterThan(today.getTime());
      });
    });
  });

  describe('BOOKING_STATUS_CONFIG', () => {
    it('should have config for all status types', () => {
      const expectedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      expectedStatuses.forEach((status) => {
        expect(BOOKING_STATUS_CONFIG).toHaveProperty(status);
      });
    });

    it('should have label, color, and icon for each status', () => {
      Object.values(BOOKING_STATUS_CONFIG).forEach((config) => {
        expect(config).toHaveProperty('label');
        expect(config).toHaveProperty('color');
        expect(config).toHaveProperty('icon');
      });
    });
  });
});
