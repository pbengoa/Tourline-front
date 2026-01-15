import { api, ApiResponse } from './api';
import { Company } from './authService';

// ============ Types ============

export type TourStatus = 'draft' | 'published' | 'archived';

export interface AdminTour {
  id: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  currency: string;
  duration: string;
  maxParticipants: number;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  categories: string[];
  includes: string[];
  excludes?: string[];
  requirements?: string[];
  status: TourStatus;
  guideId: string;
  guideName: string;
  guideAvatar?: string;
  rating: number;
  reviewCount: number;
  bookingsCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
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
  guide: {
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
  groupSize: number;
  totalPrice: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
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
  company: Company;
  stats: DashboardStats;
  recentBookings: AdminBooking[];
  upcomingTours: AdminTour[];
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
    cancelled: number;
  };
  topTours: { id: string; title: string; bookings: number; revenue: number }[];
  topGuides: { id: string; name: string; bookings: number; revenue: number }[];
}

export interface CreateTourRequest {
  title: string;
  description: string;
  image?: string;
  price: number;
  currency: string;
  duration: string;
  maxParticipants: number;
  location: string;
  coordinates?: { latitude: number; longitude: number };
  categories: string[];
  includes: string[];
  excludes?: string[];
  requirements?: string[];
  guideId: string;
  status?: TourStatus;
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
  currency: string;
}

// ============ Mock Data ============

const MOCK_COMPANY: Company = {
  id: 'company-1',
  name: 'Aventuras Chile',
  slug: 'aventuras-chile',
  description: 'La mejor experiencia de tours en Chile',
  logo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
  email: 'contacto@aventuraschile.com',
  phone: '+56222334455',
  website: 'https://aventuraschile.com',
  city: 'Santiago',
  country: 'Chile',
  isVerified: true,
  isActive: true,
};

const MOCK_ADMIN_TOURS: AdminTour[] = [
  {
    id: '1',
    title: 'Santiago Histórico y Cultural',
    description: 'Recorre el centro histórico de Santiago',
    image: 'https://images.unsplash.com/photo-1589157335738-f5e07312577e?w=600&h=400&fit=crop',
    price: 35000,
    currency: 'CLP',
    duration: '3 horas',
    maxParticipants: 10,
    location: 'Santiago',
    categories: ['cultural', 'history'],
    includes: ['Guía experto', 'Transporte público'],
    status: 'published',
    guideId: '1',
    guideName: 'Carolina Muñoz',
    guideAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    rating: 4.9,
    reviewCount: 128,
    bookingsCount: 45,
    featured: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  },
  {
    id: '2',
    title: 'Tour Astronómico en Atacama',
    description: 'Observa las estrellas en uno de los cielos más claros del mundo',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop',
    price: 45000,
    currency: 'CLP',
    duration: '3 horas',
    maxParticipants: 8,
    location: 'San Pedro de Atacama',
    categories: ['astronomy', 'nature'],
    includes: ['Transporte', 'Telescopios', 'Bebida caliente'],
    status: 'published',
    guideId: '2',
    guideName: 'Matías Soto',
    guideAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    rating: 4.8,
    reviewCount: 95,
    bookingsCount: 32,
    featured: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
  },
  {
    id: '3',
    title: 'Trekking Torres del Paine',
    description: 'Desafía tus límites en la Patagonia',
    image: 'https://images.unsplash.com/photo-1502602898669-a3873882021a?w=600&h=400&fit=crop',
    price: 120000,
    currency: 'CLP',
    duration: '10 horas',
    maxParticipants: 6,
    location: 'Puerto Natales',
    categories: ['adventure', 'trekking'],
    includes: ['Guía de montaña', 'Transporte', 'Box lunch'],
    status: 'published',
    guideId: '4',
    guideName: 'Sebastián Lagos',
    guideAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    rating: 4.9,
    reviewCount: 203,
    bookingsCount: 67,
    featured: true,
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '4',
    title: 'Ruta del Vino Casablanca',
    description: 'Degusta vinos premium en el Valle de Casablanca',
    image: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&h=400&fit=crop',
    price: 70000,
    currency: 'CLP',
    duration: '5 horas',
    maxParticipants: 8,
    location: 'Viña del Mar',
    categories: ['gastronomy', 'wine'],
    includes: ['Transporte', 'Degustaciones', 'Almuerzo'],
    status: 'draft',
    guideId: '1',
    guideName: 'Carolina Muñoz',
    guideAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    rating: 0,
    reviewCount: 0,
    bookingsCount: 0,
    featured: false,
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
  },
];

const MOCK_ADMIN_GUIDES: AdminGuide[] = [
  {
    id: '1',
    userId: 'user-1',
    name: 'Carolina Muñoz',
    email: 'carolina@aventuraschile.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    phone: '+56912345678',
    location: 'Santiago, Chile',
    languages: ['Español', 'Inglés'],
    specialties: ['City tours', 'Historia', 'Gastronomía'],
    bio: 'Guía oficial con más de 8 años de experiencia en la capital chilena.',
    pricePerHour: 35000,
    currency: 'CLP',
    rating: 4.9,
    reviewCount: 234,
    toursCount: 3,
    bookingsCount: 120,
    isVerified: true,
    isActive: true,
    createdAt: '2023-06-01T10:00:00Z',
  },
  {
    id: '2',
    userId: 'user-2',
    name: 'Matías Soto',
    email: 'matias@aventuraschile.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    phone: '+56987654321',
    location: 'San Pedro de Atacama, Chile',
    languages: ['Español', 'Inglés', 'Alemán'],
    specialties: ['Astronomía', 'Desierto', 'Cultura Andina'],
    bio: 'Apasionado por el desierto y las estrellas.',
    pricePerHour: 45000,
    currency: 'CLP',
    rating: 4.8,
    reviewCount: 189,
    toursCount: 2,
    bookingsCount: 89,
    isVerified: true,
    isActive: true,
    createdAt: '2023-07-15T10:00:00Z',
  },
  {
    id: '3',
    userId: 'user-3',
    name: 'Francisca Vargas',
    email: 'francisca@aventuraschile.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    phone: '+56911223344',
    location: 'Valparaíso, Chile',
    languages: ['Español', 'Inglés'],
    specialties: ['Arte callejero', 'Historia del Puerto'],
    bio: 'Enamorada de los cerros de Valparaíso.',
    pricePerHour: 30000,
    currency: 'CLP',
    rating: 4.7,
    reviewCount: 156,
    toursCount: 1,
    bookingsCount: 56,
    isVerified: true,
    isActive: true,
    createdAt: '2023-08-20T10:00:00Z',
  },
  {
    id: '4',
    userId: 'user-4',
    name: 'Sebastián Lagos',
    email: 'sebastian@aventuraschile.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    phone: '+56955667788',
    location: 'Puerto Natales, Chile',
    languages: ['Español', 'Inglés', 'Francés'],
    specialties: ['Trekking', 'Patagonia', 'Torres del Paine'],
    bio: 'Guía de montaña certificado, experto en la Patagonia chilena.',
    pricePerHour: 60000,
    currency: 'CLP',
    rating: 4.9,
    reviewCount: 312,
    toursCount: 1,
    bookingsCount: 145,
    isVerified: true,
    isActive: false,
    createdAt: '2023-05-10T10:00:00Z',
  },
];

const MOCK_ADMIN_BOOKINGS: AdminBooking[] = [
  {
    id: 'booking-1',
    reference: 'TL-ABC123',
    tour: { id: '1', title: 'Santiago Histórico y Cultural' },
    guide: { id: '1', name: 'Carolina Muñoz' },
    user: { id: 'u1', name: 'María González', email: 'maria@email.com', phone: '+56911111111' },
    date: '2024-02-15',
    startTime: '09:00',
    endTime: '12:00',
    groupSize: 4,
    totalPrice: 140000,
    currency: 'CLP',
    status: 'CONFIRMED',
    createdAt: '2024-02-01T15:30:00Z',
  },
  {
    id: 'booking-2',
    reference: 'TL-DEF456',
    tour: { id: '3', title: 'Trekking Torres del Paine' },
    guide: { id: '4', name: 'Sebastián Lagos' },
    user: { id: 'u2', name: 'Pedro Sánchez', email: 'pedro@email.com', phone: '+56922222222' },
    date: '2024-02-20',
    startTime: '06:00',
    endTime: '16:00',
    groupSize: 2,
    totalPrice: 240000,
    currency: 'CLP',
    status: 'PENDING',
    createdAt: '2024-02-05T10:00:00Z',
  },
  {
    id: 'booking-3',
    reference: 'TL-GHI789',
    tour: { id: '2', title: 'Tour Astronómico en Atacama' },
    guide: { id: '2', name: 'Matías Soto' },
    user: { id: 'u3', name: 'Ana Martínez', email: 'ana@email.com', phone: '+56933333333' },
    date: '2024-02-10',
    startTime: '21:00',
    endTime: '00:00',
    groupSize: 6,
    totalPrice: 270000,
    currency: 'CLP',
    status: 'COMPLETED',
    createdAt: '2024-01-28T08:00:00Z',
  },
  {
    id: 'booking-4',
    reference: 'TL-JKL012',
    tour: { id: '1', title: 'Santiago Histórico y Cultural' },
    guide: { id: '1', name: 'Carolina Muñoz' },
    user: { id: 'u4', name: 'Luis Torres', email: 'luis@email.com' },
    date: '2024-02-18',
    startTime: '14:00',
    endTime: '17:00',
    groupSize: 3,
    totalPrice: 105000,
    currency: 'CLP',
    status: 'PENDING',
    createdAt: '2024-02-08T12:00:00Z',
  },
];

// ============ Service Functions ============

// Helper to simulate API delay
const simulateDelay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const adminService = {
  // ============ Dashboard ============
  async getDashboard(): Promise<DashboardData> {
    await simulateDelay();

    const pendingCount = MOCK_ADMIN_BOOKINGS.filter((b) => b.status === 'PENDING').length;

    return {
      company: MOCK_COMPANY,
      stats: {
        totalTours: MOCK_ADMIN_TOURS.length,
        activeTours: MOCK_ADMIN_TOURS.filter((t) => t.status === 'published').length,
        totalGuides: MOCK_ADMIN_GUIDES.length,
        activeGuides: MOCK_ADMIN_GUIDES.filter((g) => g.isActive).length,
        totalBookings: MOCK_ADMIN_BOOKINGS.length,
        pendingBookings: pendingCount,
        monthlyRevenue: 4450000,
        averageRating: 4.7,
      },
      recentBookings: MOCK_ADMIN_BOOKINGS.slice(0, 5),
      upcomingTours: MOCK_ADMIN_TOURS.filter((t) => t.status === 'published').slice(0, 3),
      alerts: [
        { type: 'pending_booking', count: pendingCount, message: `${pendingCount} reservas pendientes` },
        { type: 'review', count: 5, message: '5 reseñas nuevas sin responder' },
      ],
    };
  },

  // ============ Tours ============
  async getTours(params?: {
    page?: number;
    limit?: number;
    status?: TourStatus;
    search?: string;
  }): Promise<{ data: AdminTour[]; total: number }> {
    await simulateDelay();

    let filtered = [...MOCK_ADMIN_TOURS];

    if (params?.status) {
      filtered = filtered.filter((t) => t.status === params.status);
    }

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.location.toLowerCase().includes(search) ||
          t.guideName.toLowerCase().includes(search)
      );
    }

    return { data: filtered, total: filtered.length };
  },

  async getTourById(id: string): Promise<AdminTour | null> {
    await simulateDelay();
    return MOCK_ADMIN_TOURS.find((t) => t.id === id) || null;
  },

  async createTour(data: CreateTourRequest): Promise<AdminTour> {
    await simulateDelay(800);

    const guide = MOCK_ADMIN_GUIDES.find((g) => g.id === data.guideId);

    const newTour: AdminTour = {
      id: `tour-${Date.now()}`,
      ...data,
      guideName: guide?.name || 'Guía',
      guideAvatar: guide?.avatar,
      rating: 0,
      reviewCount: 0,
      bookingsCount: 0,
      featured: false,
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_ADMIN_TOURS.push(newTour);
    return newTour;
  },

  async updateTour(id: string, data: Partial<CreateTourRequest>): Promise<AdminTour | null> {
    await simulateDelay(800);

    const index = MOCK_ADMIN_TOURS.findIndex((t) => t.id === id);
    if (index === -1) return null;

    MOCK_ADMIN_TOURS[index] = {
      ...MOCK_ADMIN_TOURS[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return MOCK_ADMIN_TOURS[index];
  },

  async deleteTour(id: string): Promise<boolean> {
    await simulateDelay();

    const index = MOCK_ADMIN_TOURS.findIndex((t) => t.id === id);
    if (index === -1) return false;

    MOCK_ADMIN_TOURS[index].status = 'archived';
    return true;
  },

  async publishTour(id: string): Promise<AdminTour | null> {
    return this.updateTour(id, { status: 'published' });
  },

  async unpublishTour(id: string): Promise<AdminTour | null> {
    return this.updateTour(id, { status: 'draft' });
  },

  // ============ Guides ============
  async getGuides(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ data: AdminGuide[]; total: number }> {
    await simulateDelay();

    let filtered = [...MOCK_ADMIN_GUIDES];

    if (params?.isActive !== undefined) {
      filtered = filtered.filter((g) => g.isActive === params.isActive);
    }

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(search) ||
          g.email.toLowerCase().includes(search) ||
          g.location.toLowerCase().includes(search)
      );
    }

    return { data: filtered, total: filtered.length };
  },

  async getGuideById(id: string): Promise<AdminGuide | null> {
    await simulateDelay();
    return MOCK_ADMIN_GUIDES.find((g) => g.id === id) || null;
  },

  async createGuide(data: CreateGuideRequest): Promise<AdminGuide> {
    await simulateDelay(800);

    const newGuide: AdminGuide = {
      id: `guide-${Date.now()}`,
      userId: `user-${Date.now()}`,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      location: data.location,
      languages: data.languages,
      specialties: data.specialties,
      bio: data.bio,
      pricePerHour: data.pricePerHour,
      currency: data.currency,
      rating: 0,
      reviewCount: 0,
      toursCount: 0,
      bookingsCount: 0,
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    MOCK_ADMIN_GUIDES.push(newGuide);
    return newGuide;
  },

  async updateGuide(id: string, data: Partial<CreateGuideRequest>): Promise<AdminGuide | null> {
    await simulateDelay(800);

    const index = MOCK_ADMIN_GUIDES.findIndex((g) => g.id === id);
    if (index === -1) return null;

    if (data.firstName || data.lastName) {
      const firstName = data.firstName || MOCK_ADMIN_GUIDES[index].name.split(' ')[0];
      const lastName = data.lastName || MOCK_ADMIN_GUIDES[index].name.split(' ').slice(1).join(' ');
      MOCK_ADMIN_GUIDES[index].name = `${firstName} ${lastName}`;
    }

    MOCK_ADMIN_GUIDES[index] = {
      ...MOCK_ADMIN_GUIDES[index],
      ...data,
    };

    return MOCK_ADMIN_GUIDES[index];
  },

  async deleteGuide(id: string): Promise<boolean> {
    await simulateDelay();

    const index = MOCK_ADMIN_GUIDES.findIndex((g) => g.id === id);
    if (index === -1) return false;

    MOCK_ADMIN_GUIDES[index].isActive = false;
    return true;
  },

  async verifyGuide(id: string): Promise<AdminGuide | null> {
    await simulateDelay();

    const index = MOCK_ADMIN_GUIDES.findIndex((g) => g.id === id);
    if (index === -1) return null;

    MOCK_ADMIN_GUIDES[index].isVerified = true;
    return MOCK_ADMIN_GUIDES[index];
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
    await simulateDelay();

    let filtered = [...MOCK_ADMIN_BOOKINGS];

    if (params?.status) {
      filtered = filtered.filter((b) => b.status === params.status);
    }

    if (params?.guideId) {
      filtered = filtered.filter((b) => b.guide.id === params.guideId);
    }

    if (params?.tourId) {
      filtered = filtered.filter((b) => b.tour.id === params.tourId);
    }

    return { data: filtered, total: filtered.length };
  },

  async getBookingStats(): Promise<BookingStats> {
    await simulateDelay();

    const pending = MOCK_ADMIN_BOOKINGS.filter((b) => b.status === 'PENDING').length;
    const confirmed = MOCK_ADMIN_BOOKINGS.filter((b) => b.status === 'CONFIRMED').length;
    const completed = MOCK_ADMIN_BOOKINGS.filter((b) => b.status === 'COMPLETED').length;
    const cancelled = MOCK_ADMIN_BOOKINGS.filter((b) => b.status === 'CANCELLED').length;

    return {
      today: { bookings: 3, revenue: 385000 },
      thisWeek: { bookings: 12, revenue: 1540000 },
      thisMonth: { bookings: 45, revenue: 4450000 },
      byStatus: { pending, confirmed, completed, cancelled },
      topTours: [
        { id: '3', title: 'Torres del Paine', bookings: 23, revenue: 2760000 },
        { id: '1', title: 'Santiago Histórico', bookings: 18, revenue: 630000 },
        { id: '2', title: 'Tour Astronómico', bookings: 12, revenue: 540000 },
      ],
      topGuides: [
        { id: '4', name: 'Sebastián Lagos', bookings: 31, revenue: 1860000 },
        { id: '1', name: 'Carolina Muñoz', bookings: 24, revenue: 840000 },
        { id: '2', name: 'Matías Soto', bookings: 15, revenue: 675000 },
      ],
    };
  },

  // ============ Company ============
  async getCompany(): Promise<Company> {
    await simulateDelay();
    return MOCK_COMPANY;
  },

  async updateCompany(data: Partial<Company>): Promise<Company> {
    await simulateDelay(800);
    Object.assign(MOCK_COMPANY, data);
    return MOCK_COMPANY;
  },
};

