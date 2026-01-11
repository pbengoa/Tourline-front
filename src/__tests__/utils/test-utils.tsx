import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AuthProvider } from '../../context';
import type { Guide, Tour, Category } from '../../types';

interface AllProvidersProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that includes all providers needed for testing
 */
const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

/**
 * Custom render function that wraps components with necessary providers
 */
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };

/**
 * Helper to create mock navigation props
 */
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(() => ({ index: 0, routes: [] })),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  setParams: jest.fn(),
});

/**
 * Helper to create mock route props
 */
export const createMockRoute = <T extends object>(params: T = {} as T) => ({
  key: 'test-route',
  name: 'TestScreen',
  params,
});

/**
 * Helper to wait for async operations
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock guide data for tests
 */
export const mockGuide: Guide = {
  id: 'test-guide-1',
  name: 'Test Guide',
  location: 'Madrid',
  rating: 4.8,
  reviewCount: 150,
  languages: ['Español', 'English'],
  specialties: ['Historia', 'Arte'],
  pricePerHour: 30,
  currency: 'EUR',
  verified: true,
  available: true,
  bio: 'A great test guide.',
  featured: false,
};

/**
 * Mock tour data for tests
 */
export const mockTour: Tour = {
  id: 'test-tour-1',
  guideId: 'test-guide-1',
  guideName: 'Test Guide',
  guideRating: 4.8,
  title: 'Test Tour',
  description: 'A great test tour.',
  duration: '3 horas',
  price: 45,
  currency: 'EUR',
  rating: 4.9,
  reviewCount: 50,
  location: 'Madrid',
  categories: ['cultural'],
  maxParticipants: 10,
  includes: ['Guía', 'Transporte'],
  featured: false,
};

/**
 * Mock category data for tests
 */
export const mockCategory: Category = {
  id: 'test-category',
  name: 'Cultural',
  icon: '🏛️',
  color: '#0066FF',
};

/**
 * Mock user data for tests
 */
export const mockUser = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
};
