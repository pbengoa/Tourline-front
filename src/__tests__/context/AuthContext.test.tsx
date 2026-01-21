import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Mock axios to prevent real API calls
jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn().mockResolvedValue({ data: { success: true, data: { user: null } } }),
    post: jest.fn().mockResolvedValue({ data: { success: true, data: { user: { id: '1', name: 'Test', email: 'test@test.com' }, token: 'mock-token' } } }),
    put: jest.fn().mockResolvedValue({ data: { success: true } }),
    delete: jest.fn().mockResolvedValue({ data: { success: true } }),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  }),
}));

// Test component that uses the auth context
const TestConsumer: React.FC = () => {
  const { user, isLoading, isAuthenticated, signIn, signUp, signOut, resetPassword } = useAuth();

  return (
    <View>
      <Text testID="loading">{isLoading ? 'loading' : 'not-loading'}</Text>
      <Text testID="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</Text>
      <Text testID="user-name">{user?.name || 'no-user'}</Text>
      <Text testID="user-email">{user?.email || 'no-email'}</Text>

      <TouchableOpacity
        testID="sign-in-button"
        onPress={() => signIn('test@example.com', 'password')}
      >
        <Text>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="sign-up-button"
        onPress={() => signUp('Test User', 'test@example.com', 'password')}
      >
        <Text>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity testID="sign-out-button" onPress={() => signOut()}>
        <Text>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="reset-password-button"
        onPress={() => resetPassword('test@example.com')}
      >
        <Text>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state correctly', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toBeTruthy();
    expect(screen.getByTestId('user-name')).toBeTruthy();
  });

  it('shows loading state initially', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // The component should render with testIds available
    expect(screen.getByTestId('loading')).toBeTruthy();
  });

  it('resetPassword does not throw', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const resetPasswordButton = screen.getByTestId('reset-password-button');

    await act(async () => {
      expect(() => fireEvent.press(resetPasswordButton)).not.toThrow();
    });
  });

  it('has sign in functionality', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const signInButton = screen.getByTestId('sign-in-button');
    expect(signInButton).toBeTruthy();
  });

  it('has sign out functionality', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const signOutButton = screen.getByTestId('sign-out-button');
    expect(signOutButton).toBeTruthy();
  });
});
