import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // TODO: Implement actual token/session check
        // Example: const storedUser = await AsyncStorage.getItem('@auth_user');
        // if (storedUser) setUser(JSON.parse(storedUser));

        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // TODO: Implement actual sign in with your backend
      // Example:
      // const response = await api.post('/auth/login', { email, password });
      // const { user, token } = response.data;
      // await AsyncStorage.setItem('@auth_token', token);
      // await AsyncStorage.setItem('@auth_user', JSON.stringify(user));

      // Simulated response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
      };

      setUser(mockUser);
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Error al iniciar sesión');
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      // TODO: Implement actual sign up with your backend
      // Example:
      // const response = await api.post('/auth/register', { name, email, password });
      // const { user, token } = response.data;
      // await AsyncStorage.setItem('@auth_token', token);
      // await AsyncStorage.setItem('@auth_user', JSON.stringify(user));

      // Simulated response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockUser: User = {
        id: '1',
        email,
        name,
      };

      setUser(mockUser);
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error('Error al crear cuenta');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // TODO: Implement actual sign out
      // Example:
      // await api.post('/auth/logout');
      // await AsyncStorage.removeItem('@auth_token');
      // await AsyncStorage.removeItem('@auth_user');

      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Error al cerrar sesión');
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      // TODO: Implement actual password reset
      // Example:
      // await api.post('/auth/reset-password', { email });

      // Simulated response
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error('Error al enviar correo de recuperación');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
