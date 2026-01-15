import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen, SearchScreen, ProfileScreen } from '../screens';
import { Colors, Spacing } from '../theme';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const { width } = Dimensions.get('window');

// Custom Tab Bar Icons with SVG-like paths using Views
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

// Custom Tab Bar Component
const CustomTabBar: React.FC<{
  state: any;
  descriptors: any;
  navigation: any;
}> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            route.name === 'Home'
              ? 'Inicio'
              : route.name === 'Search'
                ? 'Explorar'
                : 'Perfil';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[styles.tabContent, isFocused && styles.tabContentFocused]}>
                <TabIcon name={route.name} focused={isFocused} />
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
                  {label}
                </Text>
              </View>
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabContentFocused: {
    backgroundColor: Colors.primaryMuted,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textTertiary,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  tabLabelFocused: {
    color: Colors.primary,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },

  // Icon styles
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Home icon
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -2,
  },
  homeBase: {
    width: 16,
    height: 12,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  homeWindow: {
    position: 'absolute',
    bottom: 2,
    width: 5,
    height: 6,
    backgroundColor: Colors.primaryMuted,
    borderRadius: 1,
  },

  // Compass icon
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
    height: 14,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  compassCenter: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Profile icon
  profileHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
  },
  profileBody: {
    width: 18,
    height: 10,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
});
