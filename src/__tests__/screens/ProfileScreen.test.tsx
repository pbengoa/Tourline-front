import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ProfileScreen } from '../../screens/ProfileScreen';
import { createMockNavigation, createMockRoute } from '../utils/test-utils';

// Mock Alert
const mockAlert = jest.fn();
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: mockAlert,
}));

// Mock navigation
const mockNavigation = createMockNavigation();
const mockRoute = createMockRoute({});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Mock useAuth
jest.mock('../../context', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
    },
    signOut: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ProfileScreen', () => {
  const defaultProps = {
    navigation: mockNavigation as any,
    route: mockRoute as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user name', () => {
    render(<ProfileScreen {...defaultProps} />);

    expect(screen.getByText('Test User')).toBeTruthy();
  });

  it('renders user email', () => {
    render(<ProfileScreen {...defaultProps} />);

    expect(screen.getByText('test@example.com')).toBeTruthy();
  });

  it('renders edit profile button', () => {
    render(<ProfileScreen {...defaultProps} />);

    expect(screen.getByText('Editar Perfil')).toBeTruthy();
  });

  it('renders menu items', () => {
    render(<ProfileScreen {...defaultProps} />);

    expect(screen.getByText('Mis Reservas')).toBeTruthy();
    expect(screen.getByText('Favoritos')).toBeTruthy();
  });

  it('renders logout button', () => {
    render(<ProfileScreen {...defaultProps} />);

    expect(screen.getByText('Cerrar Sesión')).toBeTruthy();
  });

  it('navigates to MyBookings when Mis Reservas is pressed', () => {
    render(<ProfileScreen {...defaultProps} />);

    fireEvent.press(screen.getByText('Mis Reservas'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('MyBookings');
  });

  it('shows confirmation dialog when logout is pressed', () => {
    render(<ProfileScreen {...defaultProps} />);

    fireEvent.press(screen.getByText('Cerrar Sesión'));

    expect(mockAlert).toHaveBeenCalledWith('Cerrar Sesión', expect.any(String), expect.any(Array));
  });

  it('renders user initials in avatar', () => {
    render(<ProfileScreen {...defaultProps} />);

    // Test User -> TU
    expect(screen.getByText('TU')).toBeTruthy();
  });
});
