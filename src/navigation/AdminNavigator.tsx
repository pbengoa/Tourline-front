import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View, Platform } from 'react-native';
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

interface TabIconProps {
  icon: string;
  focused: boolean;
  badge?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, focused, badge }) => (
  <View style={styles.tabIconContainer}>
    <View style={[styles.iconBg, focused && styles.iconBgActive]}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
    </View>
    {badge !== undefined && badge > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
      </View>
    )}
  </View>
);

export const AdminNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AdminTours"
        component={AdminToursScreen}
        options={{
          tabBarLabel: 'Tours',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏔️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AdminBookings"
        component={AdminBookingsScreen}
        options={{
          tabBarLabel: 'Reservas',
          tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} badge={2} />,
        }}
      />
      <Tab.Screen
        name="AdminGuides"
        component={AdminGuidesScreen}
        options={{
          tabBarLabel: 'Guías',
          tabBarIcon: ({ focused }) => <TabIcon icon="👥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 12,
    left: 12,
    right: 12,
    height: 65,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    paddingBottom: Platform.OS === 'ios' ? 0 : 5,
    paddingTop: 5,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconBgActive: {
    backgroundColor: Colors.primaryMuted,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabIconActive: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: Colors.error,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: '700',
  },
});
