import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { notificationsService } from '../services';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
}

export interface UsePushNotificationsReturn extends PushNotificationState {
  isRegistered: boolean;
  registerForPushNotifications: () => Promise<string | null>;
  scheduleLocalNotification: (
    title: string,
    body: string,
    data?: Record<string, unknown>,
    trigger?: Notifications.NotificationTriggerInput
  ) => Promise<string>;
  cancelAllNotifications: () => Promise<void>;
  getBadgeCount: () => Promise<number>;
  setBadgeCount: (count: number) => Promise<void>;
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  console.log('🔔 Starting push notification registration...');
  console.log('📱 Device info:', {
    isDevice: Device.isDevice,
    brand: Device.brand,
    modelName: Device.modelName,
    osName: Device.osName,
    osVersion: Device.osVersion,
  });

  // Must use physical device for push notifications
  if (!Device.isDevice) {
    console.log('⚠️ Push notifications require a physical device (simulators not supported)');
    Alert.alert(
      'Notificaciones',
      'Las notificaciones push solo funcionan en dispositivos físicos, no en simuladores.'
    );
    return null;
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log('🔐 Existing permission status:', existingStatus);
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    console.log('📲 Requesting notification permission...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log('📲 New permission status:', finalStatus);
  }

  if (finalStatus !== 'granted') {
    console.log('❌ Push notification permission denied by user');
    Alert.alert(
      'Permisos requeridos',
      'Para recibir notificaciones de nuevos mensajes y reservas, habilita las notificaciones en la configuración de tu dispositivo.'
    );
    return null;
  }

  try {
    // Get the Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    console.log('🆔 Project ID:', projectId || 'No project ID');
    
    let tokenResponse;
    
    if (projectId) {
      // EAS Build mode - use projectId
      console.log('📤 Getting push token with projectId (EAS build mode)...');
      tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
    } else {
      // Expo Go development mode - try different approaches
      console.log('📤 Getting push token for Expo Go development...');
      
      // Try with experienceId for Expo Go
      const experienceId = Constants.expoConfig?.slug 
        ? `@${Constants.expoConfig?.owner || 'anonymous'}/${Constants.expoConfig?.slug}`
        : undefined;
      
      console.log('🆔 Experience ID:', experienceId);
      
      try {
        // First try: with experienceId
        if (experienceId) {
          tokenResponse = await Notifications.getExpoPushTokenAsync({
            experienceId,
          } as any);
        } else {
          // Fallback: try without any ID (older Expo versions)
          tokenResponse = await Notifications.getExpoPushTokenAsync();
        }
      } catch (innerError: any) {
        console.log('⚠️ First attempt failed, trying alternative method...');
        // Last resort: get device push token instead
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        console.log('📱 Got device push token:', deviceToken.data);
        
        // For Expo Go, we might need to use the device token
        // Return null but don't fail completely - local notifications will still work
        console.log('⚠️ Push notifications require EAS configuration for remote notifications.');
        console.log('ℹ️ Run: npx eas init (after logging in with: npx eas-cli login)');
        return null;
      }
    }
    
    token = tokenResponse.data;
    console.log('✅ Expo Push Token obtained:', token);
    console.log('ℹ️ Token type:', tokenResponse.type);
  } catch (error: any) {
    console.error('❌ Error getting push token:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
    });
    
    // Show helpful message to user
    console.log('');
    console.log('📋 Para habilitar push notifications:');
    console.log('   1. Crea cuenta en https://expo.dev/signup');
    console.log('   2. Ejecuta: npx eas-cli login');
    console.log('   3. Ejecuta: npx eas init');
    console.log('   4. Reinicia la app');
    console.log('');
    
    return null;
  }

  // Android-specific channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2D5A45',
    });

    // Create channel for booking notifications
    await Notifications.setNotificationChannelAsync('bookings', {
      name: 'Reservas',
      description: 'Notificaciones sobre tus reservas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2D5A45',
    });

    // Create channel for chat messages
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Mensajes',
      description: 'Notificaciones de nuevos mensajes',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2D5A45',
    });

    // Create channel for promotions
    await Notifications.setNotificationChannelAsync('promotions', {
      name: 'Promociones',
      description: 'Ofertas y promociones especiales',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return token;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    try {
      setError(null);
      const token = await registerForPushNotificationsAsync();
      
      if (token) {
        setExpoPushToken(token);
        setIsRegistered(true);
        
        // Send token to backend
        console.log('📤 Sending push token to backend...');
        console.log('Token:', token);
        console.log('Platform:', Platform.OS);
        
        try {
          await notificationsService.registerPushToken(
            token,
            Platform.OS as 'ios' | 'android'
          );
          console.log('✅ Push token registered with backend successfully!');
        } catch (err: any) {
          console.error('❌ Failed to register token with backend:', err);
          console.error('Backend error details:', {
            message: err?.message,
            response: err?.response?.data,
            status: err?.response?.status,
          });
          // Don't fail completely - push might still work for local notifications
        }
      } else {
        console.log('⚠️ No token received, push notifications will not work');
      }
      
      return token;
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Failed to register for push notifications');
      return null;
    }
  }, []);

  const scheduleLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: Record<string, unknown>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> => {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: trigger || null, // null = immediate
    });
  }, []);

  const cancelAllNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  const getBadgeCount = useCallback(async (): Promise<number> => {
    return await Notifications.getBadgeCountAsync();
  }, []);

  const setBadgeCount = useCallback(async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  }, []);

  useEffect(() => {
    // DON'T register automatically on mount - let NotificationsContext handle it after login
    // This prevents 401 errors when trying to register without authentication
    // registerForPushNotifications();

    // Listen for incoming notifications (when app is in foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification received:', notification);
        setNotification(notification);
      }
    );

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        const data = response.notification.request.content.data;
        
        // Handle navigation based on notification type
        // This will be handled by the NotificationsContext
        console.log('Notification data:', data);
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    error,
    isRegistered,
    registerForPushNotifications,
    scheduleLocalNotification,
    cancelAllNotifications,
    getBadgeCount,
    setBadgeCount,
  };
}
