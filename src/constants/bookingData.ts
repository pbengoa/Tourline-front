import type { Booking, BookingDay, TimeSlot } from '../types/booking';

// Generate time slots for a day
export const generateTimeSlots = (available: boolean = true): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHours = [9, 10, 11, 14, 15, 16, 17, 18];

  startHours.forEach((hour, index) => {
    slots.push({
      id: `slot-${index}`,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 2).toString().padStart(2, '0')}:00`,
      available: available && Math.random() > 0.3, // 70% availability
    });
  });

  return slots;
};

// Generate available days for the next 30 days
export const generateAvailableDays = (): BookingDay[] => {
  const days: BookingDay[] = [];
  const today = new Date();

  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const available = Math.random() > 0.2; // 80% days available

    days.push({
      date: date.toISOString().split('T')[0],
      available,
      slots: generateTimeSlots(available),
    });
  }

  return days;
};

// Mock user bookings
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    tourId: '1',
    tourTitle: 'Madrid de los Austrias',
    guideId: '1',
    guideName: 'María García',
    location: 'Madrid',
    date: '2026-01-15',
    startTime: '10:00',
    endTime: '13:00',
    duration: '3 horas',
    participants: 2,
    pricePerPerson: 35,
    totalPrice: 70,
    currency: 'EUR',
    status: 'confirmed',
    createdAt: '2026-01-08T10:30:00Z',
    confirmedAt: '2026-01-08T14:00:00Z',
    userMessage:
      'Estamos muy emocionados por el tour. ¿Hay algún lugar para tomar café cerca del punto de encuentro?',
    guideResponse:
      '¡Hola! Sí, hay varios cafés cerca. Nos vemos en la Plaza Mayor, junto a la estatua.',
  },
  {
    id: 'booking-2',
    tourId: '4',
    tourTitle: 'Alhambra al Atardecer',
    guideId: '4',
    guideName: 'Pedro Sánchez',
    location: 'Granada',
    date: '2026-01-20',
    startTime: '16:00',
    endTime: '19:00',
    duration: '3 horas',
    participants: 4,
    pricePerPerson: 75,
    totalPrice: 300,
    currency: 'EUR',
    status: 'pending',
    createdAt: '2026-01-10T09:15:00Z',
    userMessage: 'Somos 4 adultos. ¿Es posible hacer el tour en inglés también?',
  },
  {
    id: 'booking-3',
    tourId: '2',
    tourTitle: 'Tapas y Vinos en Barcelona',
    guideId: '2',
    guideName: 'Carlos Rodríguez',
    location: 'Barcelona',
    date: '2025-12-28',
    startTime: '19:00',
    endTime: '23:00',
    duration: '4 horas',
    participants: 2,
    pricePerPerson: 65,
    totalPrice: 130,
    currency: 'EUR',
    status: 'completed',
    createdAt: '2025-12-20T11:00:00Z',
    confirmedAt: '2025-12-20T15:30:00Z',
  },
  {
    id: 'booking-4',
    guideId: '3',
    guideName: 'Ana Martínez',
    location: 'Sevilla',
    date: '2026-01-05',
    startTime: '11:00',
    endTime: '13:30',
    duration: '2.5 horas',
    participants: 1,
    pricePerPerson: 40,
    totalPrice: 40,
    currency: 'EUR',
    status: 'cancelled',
    createdAt: '2025-12-30T16:00:00Z',
    cancelledAt: '2026-01-03T10:00:00Z',
    cancellationReason: 'Cambio de planes de viaje',
  },
];

export const AVAILABLE_DAYS = generateAvailableDays();
