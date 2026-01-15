import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context';
import { AuthNavigator } from './AuthNavigator';
import { RootNavigator } from './RootNavigator';
import { AdminNavigator } from './AdminNavigator';
import { Colors } from '../theme';

export const AppNavigator: React.FC = () => {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

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
    return <AuthNavigator />;
  }

  // Authenticated - check role and show appropriate navigator
  if (isAdmin) {
    return <AdminNavigator />;
  }

  // Default: tourist/guide - show main app
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
