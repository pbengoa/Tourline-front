import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { LoginScreen } from '../../screens/auth/LoginScreen';
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

describe('LoginScreen', () => {
  const defaultProps = {
    navigation: mockNavigation as any,
    route: mockRoute as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login title', () => {
    render(<LoginScreen {...defaultProps} />);

    expect(screen.getByText('Iniciar Sesión')).toBeTruthy();
  });

  it('renders email input', () => {
    render(<LoginScreen {...defaultProps} />);

    expect(screen.getByPlaceholderText(/correo electrónico/i)).toBeTruthy();
  });

  it('renders password input', () => {
    render(<LoginScreen {...defaultProps} />);

    expect(screen.getByPlaceholderText(/contraseña/i)).toBeTruthy();
  });

  it('renders login button', () => {
    render(<LoginScreen {...defaultProps} />);

    expect(screen.getByText('Entrar')).toBeTruthy();
  });

  it('renders forgot password link', () => {
    render(<LoginScreen {...defaultProps} />);

    expect(screen.getByText(/olvidaste tu contraseña/i)).toBeTruthy();
  });

  it('renders register link', () => {
    render(<LoginScreen {...defaultProps} />);

    expect(screen.getByText(/crear cuenta/i)).toBeTruthy();
  });

  it('allows typing in email input', () => {
    render(<LoginScreen {...defaultProps} />);

    const emailInput = screen.getByPlaceholderText(/correo electrónico/i);
    fireEvent.changeText(emailInput, 'user@test.com');

    expect(emailInput.props.value).toBe('user@test.com');
  });

  it('allows typing in password input', () => {
    render(<LoginScreen {...defaultProps} />);

    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    fireEvent.changeText(passwordInput, 'mypassword');

    expect(passwordInput.props.value).toBe('mypassword');
  });

  it('navigates to ForgotPassword when link is pressed', () => {
    render(<LoginScreen {...defaultProps} />);

    const forgotPasswordLink = screen.getByText(/olvidaste tu contraseña/i);
    fireEvent.press(forgotPasswordLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('navigates to Register when link is pressed', () => {
    render(<LoginScreen {...defaultProps} />);

    const registerLink = screen.getByText(/crear cuenta/i);
    fireEvent.press(registerLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });
});
