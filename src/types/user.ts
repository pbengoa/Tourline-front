// User roles
export type UserRole = 'tourist' | 'guide' | 'admin' | 'super_admin';

// User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  companyId?: string;
  guideProfileId?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Company interface
export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city: string;
  country: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth response
export interface AuthResponse {
  user: User;
  token: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  companyName?: string; // Only if role is admin
}

