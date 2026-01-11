/**
 * Guide/Tour guide types
 */
export interface Guide {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  location: string;
  languages: string[];
  specialties: string[];
  bio: string;
  pricePerHour: number;
  currency: string;
  verified: boolean;
  featured: boolean;
  available: boolean;
}

export interface Tour {
  id: string;
  title: string;
  description: string;
  image?: string;
  guideId: string;
  guideName: string;
  guideAvatar?: string;
  guideRating: number;
  location: string;
  duration: string; // e.g., "3 hours", "Full day"
  price: number;
  currency: string;
  maxParticipants: number;
  categories: string[];
  includes: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type SortOption = 'rating' | 'price_low' | 'price_high' | 'reviews';

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  languages?: string[];
  sortBy?: SortOption;
}

