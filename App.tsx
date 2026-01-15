import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { AppNavigator } from './src/navigation';
import { SplashScreen } from './src/screens';

export default function App() {
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
    <SafeAreaProvider>
      <AuthProvider>
        <FavoritesProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </FavoritesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
