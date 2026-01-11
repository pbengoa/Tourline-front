import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { DetailsScreen, GuideDetailScreen } from '../screens';
import { Colors, Typography } from '../theme';
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
          ...Typography.h4,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Detalles',
        })}
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
    </Stack.Navigator>
  );
};
