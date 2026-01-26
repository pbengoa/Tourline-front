import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen, SearchScreen, ProfileScreen } from '../screens';
import { Colors } from '../theme';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon: React.FC<{
  name: keyof MainTabParamList;
  focused: boolean;
}> = ({ name, focused }) => {
  const color = focused ? Colors.primary : Colors.textTertiary;

  // Home Icon
  if (name === 'Home') {
    return (
      <View style={styles.iconContainer}>
        <View style={[styles.homeRoof, { borderBottomColor: color }]} />
        <View style={[styles.homeBase, { backgroundColor: color }]} />
        {focused && <View style={styles.homeWindow} />}
      </View>
    );
  }

  // Search/Explore Icon (Compass)
  if (name === 'Search') {
    return (
      <View style={styles.iconContainer}>
        <View style={[styles.compassOuter, { borderColor: color }]}>
          <View style={[styles.compassNeedle, { backgroundColor: color }]} />
          <View style={[styles.compassCenter, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  // Profile Icon
  if (name === 'Profile') {
    return (
      <View style={styles.iconContainer}>
        <View style={[styles.profileHead, { backgroundColor: color }]} />
        <View style={[styles.profileBody, { backgroundColor: color }]} />
      </View>
    );
  }

  return null;
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
              <TabIcon name="Home" focused={focused} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Explorar',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
              <TabIcon name="Search" focused={focused} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
              <TabIcon name="Profile" focused={focused} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    height: 80,
    paddingBottom: 15,
    paddingTop: 10,
    paddingHorizontal: 20,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  tabItem: {
    paddingTop: 5,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  tabIconWrapper: {
    width: 60,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  tabIconWrapperActive: {
    backgroundColor: '#E8F0ED',
  },
  iconContainer: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Home Icon Styles
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 2,
  },
  homeBase: {
    width: 16,
    height: 13,
    borderRadius: 2,
  },
  homeWindow: {
    position: 'absolute',
    width: 5,
    height: 5,
    backgroundColor: '#E8F0ED',
    bottom: 2,
    borderRadius: 1,
  },
  // Search/Compass Icon Styles
  compassOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassNeedle: {
    width: 2,
    height: 9,
    borderRadius: 1,
    position: 'absolute',
  },
  compassCenter: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  // Profile Icon Styles
  profileHead: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginBottom: 2,
  },
  profileBody: {
    width: 16,
    height: 11,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});
