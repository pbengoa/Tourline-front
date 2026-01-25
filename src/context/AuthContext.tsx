import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService, User, UserRole, getErrorMessage } from '../services';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Email verification
  isEmailVerified: boolean;
  needsEmailVerification: boolean;
  // Role checks
  userRole: UserRole | null;
  isAdmin: boolean;
  isGuide: boolean;
  isTourist: boolean;
  isProvider: boolean;
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role?: UserRole,
    companyName?: string
  ) => Promise<User | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived role states
  const userRole = useMemo(() => {
    const role = user?.role || null;
    console.log('🎭 AuthContext - userRole calculated:', role);
    return role;
  }, [user]);

  const isAdmin = useMemo(() => {
    const result = authService.isAdmin(user);
    console.log('🔐 AuthContext - isAdmin:', result);
    return result;
  }, [user]);

  const isGuide = useMemo(() => {
    const result = authService.isGuide(user);
    console.log('🧑‍🏫 AuthContext - isGuide:', result);
    return result;
  }, [user]);

  const isTourist = useMemo(() => {
    const result = authService.isTourist(user);
    console.log('🧳 AuthContext - isTourist:', result);
    return result;
  }, [user]);

  const isProvider = useMemo(() => {
    const result = user?.role === 'provider';
    console.log('🏢 AuthContext - isProvider:', result, '(user.role:', user?.role, ')');
    return result;
  }, [user]);

  // Email verification status
  const isEmailVerified = useMemo(() => user?.emailVerified ?? false, [user]);
  const needsEmailVerification = useMemo(() => !!user && !user.emailVerified, [user]);

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
        console.log('🏢 Is Provider?:', response.data.user.role === 'provider');
        console.log('🧑‍🏫 Is Guide?:', response.data.user.role === 'guide');
        console.log('🔐 Is Admin?:', response.data.user.role === 'admin');
        console.log('🧳 Is Tourist?:', response.data.user.role === 'tourist');
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
    ): Promise<User | null> => {
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
          const registeredUser = response.data.user;

          // Only auto-login if email is already verified
          // Otherwise, let the UI handle verification flow
          if (registeredUser.emailVerified) {
            setUser(registeredUser);
          }

          return registeredUser;
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
      await authService.forgotPassword(email);
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

  const resendVerificationEmail = useCallback(async () => {
    if (!user?.email) {
      throw new Error('No hay email para verificar');
    }
    try {
      await authService.resendVerification(user.email);
    } catch (error) {
      console.error('Resend verification error:', error);
      throw new Error(getErrorMessage(error));
    }
  }, [user?.email]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isEmailVerified,
        needsEmailVerification,
        userRole,
        isAdmin,
        isGuide,
        isTourist,
        isProvider,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshUser,
        resendVerificationEmail,
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
