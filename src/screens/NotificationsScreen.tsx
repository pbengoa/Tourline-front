import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography } from '../theme';
import { MinimalHeader } from '../components';
import { useNotifications } from '../context';
import type { Notification, NotificationType } from '../services/notificationsService';
import type { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NOTIFICATION_CONFIG: Record<NotificationType, { icon: string; color: string }> = {
  booking_confirmed: { icon: '✅', color: Colors.success },
  booking_cancelled: { icon: '❌', color: Colors.error },
  booking_reminder: { icon: '⏰', color: Colors.warning },
  review_received: { icon: '⭐', color: Colors.accent },
  review_response: { icon: '💬', color: Colors.info },
  promotion: { icon: '🎉', color: Colors.secondary },
  system: { icon: 'ℹ️', color: Colors.textTertiary },
  chat_message: { icon: '💬', color: Colors.primary },
};

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    const { data, type } = notification;
    
    switch (type) {
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_reminder':
        if (data?.bookingId) {
          navigation.navigate('BookingDetail', { bookingId: data.bookingId });
        } else {
          navigation.navigate('MyBookings');
        }
        break;
        
      case 'chat_message':
        navigation.navigate('ChatList');
        break;
        
      case 'review_received':
      case 'review_response':
        if (data?.tourId) {
          navigation.navigate('Details', { id: data.tourId });
        }
        break;
        
      case 'promotion':
        if (data?.tourId) {
          navigation.navigate('Details', { id: data.tourId });
        } else {
          navigation.navigate('Search');
        }
        break;
        
      default:
        break;
    }
  }, [navigation, markAsRead]);

  const handleDelete = useCallback((notificationId: string) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteNotification(notificationId),
        },
      ]
    );
  }, [deleteNotification]);

  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount > 0) {
      Alert.alert(
        'Marcar todas como leídas',
        '¿Marcar todas las notificaciones como leídas?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Marcar', onPress: markAllAsRead },
        ]
      );
    }
  }, [unreadCount, markAllAsRead]);

  const renderNotification = ({ item }: { item: Notification }) => {
    const config = NOTIFICATION_CONFIG[item.type] || NOTIFICATION_CONFIG.system;
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadItem,
        ]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, !item.isRead && styles.unreadText]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>Sin notificaciones</Text>
      <Text style={styles.emptyText}>
        Cuando recibas notificaciones, aparecerán aquí
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MinimalHeader
        title="Notificaciones"
        onBack={() => navigation.goBack()}
        rightElement={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Marcar leídas</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshNotifications}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  markAllText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
  },
  unreadItem: {
    backgroundColor: Colors.primaryMuted,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...Typography.labelLarge,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadText: {
    fontWeight: '700',
  },
  time: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  body: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.lg + 44 + Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
