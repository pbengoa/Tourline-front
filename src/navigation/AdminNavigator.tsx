import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View } from 'react-native';
import { Colors, Typography } from '../theme';
import {
  DashboardScreen,
  AdminToursScreen,
  AdminGuidesScreen,
  AdminBookingsScreen,
  AdminSettingsScreen,
} from '../screens/admin';
import type { AdminTabParamList } from '../types';

const Tab = createBottomTabNavigator<AdminTabParamList>();

const TabIcon: React.FC<{ icon: string; focused: boolean; label: string }> = ({
  icon,
  focused,
  label,
}) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
  </View>
);

export const AdminNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📊" focused={focused} label="Dashboard" />
          ),
        }}
      />
      <Tab.Screen
        name="AdminTours"
        component={AdminToursScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏔️" focused={focused} label="Tours" />
          ),
        }}
      />
      <Tab.Screen
        name="AdminGuides"
        component={AdminGuidesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👥" focused={focused} label="Guías" />
          ),
        }}
      />
      <Tab.Screen
        name="AdminBookings"
        component={AdminBookingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📅" focused={focused} label="Reservas" />
          ),
        }}
      />
      <Tab.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚙️" focused={focused} label="Ajustes" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontSize: 10,
  },
  tabLabelFocused: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

