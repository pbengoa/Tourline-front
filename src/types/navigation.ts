import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

/**
 * Root stack navigator param list
 */
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Details: { id: string; title?: string };
  // Add more root stack screens here
};

/**
 * Main tab navigator param list
 */
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

/**
 * Root stack screen props
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Main tab screen props
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

/**
 * Declare global navigation types for useNavigation hook
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

