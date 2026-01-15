import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

/**
 * Booking date slot type
 */
export interface BookingDateSlot {
  date: string;
  startTime: string;
  endTime: string;
}

/**
 * Auth stack navigator param list
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

/**
 * Root stack navigator param list
 */
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  MainTabs: undefined; // Alias for Main navigation
  Details: { id: string; title?: string };
  GuideDetail: { guideId: string };
  CompanyDetail: { companyId: string };  // NEW
  Favorites: undefined; // NEW - Favorites screen
  // Booking flow (UPDATED - now tour-centric)
  Booking: { tourId: string };           // ⚠️ CHANGED: only tourId needed
  BookingConfirmation: {
    tourId: string;
    date: string;
    startTime: string;
    participants: number;
    specialRequests?: string;
    userPhone?: string;
    totalPrice: number;
  };
  BookingSuccess: {
    bookingId: string;
    bookingReference: string;
    tourTitle: string;
    companyName: string;
    date: string;
    startTime: string;
    participants: number;
  };
  MyBookings: undefined;
  BookingDetail: { bookingId: string };
  // Chat flow
  ChatList: undefined;
  Chat: {
    conversationId: string;
    participantName: string;
    participantId: string;
  };
};

/**
 * Main tab navigator param list (Tourist)
 */
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

/**
 * Admin tab navigator param list
 */
export type AdminTabParamList = {
  Dashboard: undefined;
  AdminTours: undefined;
  AdminGuides: undefined;
  AdminBookings: undefined;
  AdminSettings: undefined;
};

/**
 * Admin stack param list (for nested navigation)
 */
export type AdminStackParamList = {
  AdminMain: NavigatorScreenParams<AdminTabParamList>;
  TourForm: { tourId?: string }; // undefined = create, with id = edit
  GuideForm: { guideId?: string };
  BookingDetail: { bookingId: string };
  CompanySettings: undefined;
};

/**
 * Auth stack screen props
 */
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

/**
 * Root stack screen props
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

/**
 * Main tab screen props (Tourist)
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

/**
 * Admin tab screen props
 */
export type AdminTabScreenProps<T extends keyof AdminTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, T>,
  NativeStackScreenProps<AdminStackParamList>
>;

/**
 * Admin stack screen props
 */
export type AdminStackScreenProps<T extends keyof AdminStackParamList> = NativeStackScreenProps<
  AdminStackParamList,
  T
>;

/**
 * Declare global navigation types for useNavigation hook
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
