import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, NotificationsProvider, NetworkProvider, navigationRef } from './src/context';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { ErrorBoundary, OfflineBanner } from './src/components';
import { AppNavigator } from './src/navigation';
import { SplashScreen } from './src/screens';

export default function App() {
  console.log('📱📱📱 APP COMPONENT RENDERING 📱📱📱');
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NetworkProvider>
          <AuthProvider>
            <NavigationContainer ref={navigationRef}>
              <NotificationsProvider>
                <FavoritesProvider>
                  <View style={styles.container}>
                    <StatusBar style="dark" />
                    <OfflineBanner />
                    <AppNavigator />
                  </View>
                </FavoritesProvider>
              </NotificationsProvider>
            </NavigationContainer>
          </AuthProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
