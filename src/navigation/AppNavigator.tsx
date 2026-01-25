import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context';
import { AuthNavigator } from './AuthNavigator';
import { RootNavigator } from './RootNavigator';
import { AdminNavigator } from './AdminNavigator';
import { GuideNavigator } from './GuideNavigator';
import { ProviderNavigator } from './ProviderNavigator';
import { EmailVerificationRequiredScreen } from '../screens/auth';
import { Colors } from '../theme';

export const AppNavigator: React.FC = () => {
  const { isLoading, isAuthenticated, isEmailVerified, isAdmin, isGuide, isProvider, user, userRole } = useAuth();

  // Debug: Log navigation decision
  console.log('🔀 AppNavigator - Navigation Decision:', {
    isAuthenticated,
    isEmailVerified,
    userRole,
    isAdmin,
    isProvider,
    isGuide,
  });

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Not authenticated - show auth screens
  if (!isAuthenticated) {
    console.log('➡️  Showing: AuthNavigator');
    return <AuthNavigator />;
  }

  // Authenticated but email not verified - show verification required screen
  if (!isEmailVerified) {
    console.log('➡️  Showing: EmailVerificationRequired');
    return <EmailVerificationRequiredScreen />;
  }

  // Authenticated and verified - check role and show appropriate navigator
  if (isAdmin) {
    console.log('➡️  Showing: AdminNavigator (role: admin)');
    return <AdminNavigator />;
  }

  if (isProvider) {
    console.log('➡️  Showing: ProviderNavigator (role: provider)');
    return <ProviderNavigator />;
  }

  if (isGuide) {
    console.log('➡️  Showing: GuideNavigator (role: guide)');
    return <GuideNavigator />;
  }

  // Default: tourist - show main app
  console.log('➡️  Showing: RootNavigator (role: tourist - default)');
  return <RootNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
