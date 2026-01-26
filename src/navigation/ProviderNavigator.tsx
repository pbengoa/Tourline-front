import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, StyleSheet, View, Platform } from 'react-native';
import { Colors, Typography } from '../theme';
import { ProfileScreen } from '../screens';
import { ChatListScreen, ChatScreen } from '../screens/chat';
import { DashboardScreen, AdminToursScreen, AdminGuidesScreen } from '../screens/admin';
import { ProviderAgendaScreen, ProviderExploreScreen, ProviderStatsScreen } from '../screens/provider';
import type { ProviderTabParamList } from '../types';

const Tab = createBottomTabNavigator<ProviderTabParamList>();
const Stack = createNativeStackNavigator();

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

const ProviderTabs: React.FC = () => {
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
      {/* Agenda - Pantalla principal */}
      <Tab.Screen
        name="ProviderAgenda"
        component={ProviderAgendaScreen}
        options={{
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
        }}
      />

      {/* Explorar - Tours y Guías */}
      <Tab.Screen
        name="ProviderExplore"
        component={ProviderExploreScreen}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ focused }) => <TabIcon icon="🔍" focused={focused} />,
        }}
      />

      {/* Estadísticas */}
      <Tab.Screen
        name="ProviderStats"
        component={ProviderStatsScreen}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} />,
        }}
      />

      {/* Perfil de la empresa/guía */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏢" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const ProviderNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderMain" component={ProviderTabs} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
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
