import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService, User, UserRole, getErrorMessage } from '../services';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Role checks
  userRole: UserRole | null;
  isAdmin: boolean;
  isGuide: boolean;
  isTourist: boolean;
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role?: UserRole,
    companyName?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived role states
  const userRole = useMemo(() => user?.role || null, [user]);
  const isAdmin = useMemo(() => authService.isAdmin(user), [user]);
  const isGuide = useMemo(() => authService.isGuide(user), [user]);
  const isTourist = useMemo(() => authService.isTourist(user), [user]);

  // Check for existing session on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // Check if we have a stored user
        const storedUser = await authService.getStoredUser();

        if (storedUser) {
          // Verify the token is still valid by fetching current user
          try {
            const response = await authService.getMe();
            if (response.success) {
              setUser(response.data);
            } else {
              // Token invalid, clear storage
              await authService.logout();
            }
          } catch {
            // Token expired or invalid
            await authService.logout();
          }
        }
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
      const response = await authService.login({ email, password });

      if (response.success) {
        console.log('🔑 Login successful!');
        console.log('👤 User data:', JSON.stringify(response.data.user, null, 2));
        console.log('🎭 Role:', response.data.user.role);
        const isAdminRole =
          response.data.user.role === 'admin' || response.data.user.role === 'super_admin';
        console.log('🔐 Is Admin?:', isAdminRole);
        setUser(response.data.user);
      } else {
        throw new Error('Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const signUp = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      role: UserRole = 'tourist',
      companyName?: string
    ) => {
      try {
        const response = await authService.register({
          firstName,
          lastName,
          email,
          password,
          role,
          companyName,
        });

        if (response.success) {
          setUser(response.data.user);
        } else {
          throw new Error('Error al crear cuenta');
        }
      } catch (error) {
        console.error('Sign up error:', error);
        throw new Error(getErrorMessage(error));
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      // Note: The backend doesn't have a forgot password endpoint yet
      // This is a placeholder that can be implemented later
      console.log('Reset password requested for:', email);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        userRole,
        isAdmin,
        isGuide,
        isTourist,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshUser,
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

// Re-export User type for convenience
export type { User, UserRole };
