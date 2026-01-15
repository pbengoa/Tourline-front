import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { DetailsScreen, GuideDetailScreen, FavoritesScreen, CompanyDetailScreen } from '../screens';
import {
  BookingScreen,
  BookingConfirmationScreen,
  BookingSuccessScreen,
  MyBookingsScreen,
  BookingDetailScreen,
} from '../screens/booking';
import { ChatListScreen, ChatScreen } from '../screens/chat';
import { Colors } from '../theme';
import { MOCK_GUIDES } from '../constants/mockData';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        headerShadowVisible: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Detalles',
        })}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailScreen}
        options={({ route }) => {
          const guide = MOCK_GUIDES.find((g) => g.id === route.params?.guideId);
          return {
            title: guide?.name || 'Perfil del Guía',
          };
        }}
      />
      <Stack.Screen
        name="CompanyDetail"
        component={CompanyDetailScreen}
        options={{ headerShown: false }}
      />
      {/* Booking flow */}
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Reservar' }} />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{ title: 'Confirmar reserva' }}
      />
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: 'Mis reservas' }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{ title: 'Detalle de reserva' }}
      />
      {/* Chat flow */}
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Mensajes' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
