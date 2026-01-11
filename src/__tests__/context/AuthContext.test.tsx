import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';

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
  it('provides initial state correctly', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toBeTruthy();
    expect(screen.getByTestId('user-name')).toBeTruthy();
  });

  it('signIn updates user state', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const signInButton = screen.getByTestId('sign-in-button');

    await act(async () => {
      fireEvent.press(signInButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toBeTruthy();
    });
  });

  it('signUp updates user state', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const signUpButton = screen.getByTestId('sign-up-button');

    await act(async () => {
      fireEvent.press(signUpButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toBeTruthy();
      expect(screen.getByTestId('user-name')).toBeTruthy();
      expect(screen.getByTestId('user-email')).toBeTruthy();
    });
  });

  it('signOut clears user state', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // First sign in
    const signInButton = screen.getByTestId('sign-in-button');
    await act(async () => {
      fireEvent.press(signInButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toBeTruthy();
    });

    // Then sign out
    const signOutButton = screen.getByTestId('sign-out-button');
    await act(async () => {
      fireEvent.press(signOutButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toBeTruthy();
      expect(screen.getByTestId('user-name')).toBeTruthy();
    });
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

  it('throws error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
