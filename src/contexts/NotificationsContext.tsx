import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { NavigationContainerRef } from '@react-navigation/native';
import { notificationsService, Notification } from '../services';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAuth } from '../context/AuthContext';

interface NotificationsContextData {
  // Push notification state
  expoPushToken: string | null;
  isRegistered: boolean;
  
  // In-app notifications
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  
  // Local notifications
  scheduleBookingReminder: (
    bookingId: string,
    tourTitle: string,
    date: Date,
    hoursBeforeScheduled?: number
  ) => Promise<void>;
  
  // Badge management
  updateBadgeCount: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextData>({} as NotificationsContextData);

// Navigation reference to use outside of React components
export const navigationRef = React.createRef<NavigationContainerRef<any>>();

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  console.log('🔔🔔🔔 NotificationsProvider MOUNTED 🔔🔔🔔');
  
  // Get user from auth context to know when they log in
  const { user } = useAuth();
  
  const {
    expoPushToken,
    isRegistered,
    notification: receivedNotification,
    scheduleLocalNotification,
    setBadgeCount,
    registerForPushNotifications,
  } = usePushNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const responseListener = useRef<Notifications.Subscription>();

  // Fetch notifications from backend
  const refreshNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await notificationsService.getAll({ limit: 50 });
      if (response.success && response.data) {
        setNotifications(response.data);
        const unread = response.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
        await setBadgeCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setBadgeCount]);

  // Fetch unread count
  const updateBadgeCount = useCallback(async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
      await setBadgeCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [setBadgeCount]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      await updateBadgeCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [updateBadgeCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await setBadgeCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [setBadgeCount]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.delete(notificationId);
      const notif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notif && !notif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        await updateBadgeCount();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications, updateBadgeCount]);

  // Schedule a local booking reminder
  const scheduleBookingReminder = useCallback(async (
    bookingId: string,
    tourTitle: string,
    tourDate: Date,
    hoursBeforeScheduled: number = 24
  ) => {
    const reminderTime = new Date(tourDate.getTime() - hoursBeforeScheduled * 60 * 60 * 1000);
    
    // Don't schedule if the reminder time has already passed
    if (reminderTime <= new Date()) {
      console.log('Reminder time has already passed, skipping');
      return;
    }

    await scheduleLocalNotification(
      '🎫 Recordatorio de Tour',
      `Tu tour "${tourTitle}" es ${hoursBeforeScheduled === 24 ? 'mañana' : `en ${hoursBeforeScheduled} horas`}. ¡No olvides prepararte!`,
      {
        type: 'booking_reminder',
        bookingId,
        tourTitle,
      },
      {
        date: reminderTime,
      }
    );

    console.log(`✅ Reminder scheduled for ${reminderTime.toISOString()}`);
  }, [scheduleLocalNotification]);

  // Handle navigation when notification is tapped
  const handleNotificationNavigation = useCallback((data: any) => {
    if (!navigationRef.current) {
      console.log('Navigation ref not ready');
      return;
    }

    const { type, bookingId, tourId, conversationId, participantName, participantId } = data;

    switch (type) {
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_reminder':
        if (bookingId) {
          navigationRef.current.navigate('BookingDetail', { bookingId });
        } else {
          navigationRef.current.navigate('MyBookings');
        }
        break;
        
      case 'chat_message':
        if (conversationId) {
          navigationRef.current.navigate('Chat', {
            conversationId,
            participantName: participantName || 'Chat',
            participantId: participantId || '',
          });
        } else {
          navigationRef.current.navigate('ChatList');
        }
        break;
        
      case 'review_received':
      case 'review_response':
        if (tourId) {
          navigationRef.current.navigate('Details', { id: tourId });
        }
        break;
        
      case 'promotion':
        if (tourId) {
          navigationRef.current.navigate('Details', { id: tourId });
        } else {
          navigationRef.current.navigate('Search');
        }
        break;
        
      default:
        // Navigate to notifications list
        navigationRef.current.navigate('NotificationsList');
        break;
    }
  }, []);

  // Listen for notification taps
  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification response:', response);
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
      }
    );

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [handleNotificationNavigation]);

  // Refresh notifications when a push notification is received
  useEffect(() => {
    if (receivedNotification) {
      console.log('📬 New notification received, refreshing...');
      refreshNotifications();
    }
  }, [receivedNotification, refreshNotifications]);
  
  // Log when token changes
  useEffect(() => {
    if (expoPushToken) {
      console.log('✅✅✅ PUSH TOKEN OBTAINED:', expoPushToken);
    }
  }, [expoPushToken]);

  // Register push token and load notifications when user logs in
  useEffect(() => {
    if (user?.id) {
      console.log('👤 User logged in, registering push token and loading notifications...');
      // Register the token now that we have authentication
      registerForPushNotifications();
      // Load notifications now that we're authenticated
      refreshNotifications();
    }
  }, [user?.id, registerForPushNotifications, refreshNotifications]); // Only when user ID changes (login/logout)

  return (
    <NotificationsContext.Provider
      value={{
        expoPushToken,
        isRegistered,
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        scheduleBookingReminder,
        updateBadgeCount,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextData => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }

  return context;
};
