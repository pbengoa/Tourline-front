import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { TimeSlot } from './booking';

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
  Details: { id: string; title?: string };
  GuideDetail: { guideId: string };
  // Booking flow
  Booking: { guideId: string; tourId?: string };
  BookingConfirmation: {
    guideId: string;
    tourId?: string;
    date: string;
    timeSlot: TimeSlot;
    participants: number;
    message?: string;
    totalPrice: number;
  };
  BookingSuccess: {
    bookingId: string;
    guideName: string;
    tourTitle?: string;
    date: string;
    startTime: string;
  };
  MyBookings: undefined;
  BookingDetail: { bookingId: string };
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
 * Auth stack screen props
 */
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

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
