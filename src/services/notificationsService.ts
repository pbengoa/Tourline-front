import { api, ApiResponse } from './api';

// ============ TYPES ============

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'review_received'
  | 'review_response'
  | 'promotion'
  | 'system'
  | 'chat_message';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    tourId?: string;
    bookingId?: string;
    reviewId?: string;
    actionType?: string;
    actionValue?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  bookingUpdates: boolean;
  promotions: boolean;
  reviews: boolean;
  chatMessages: boolean;
  systemAlerts: boolean;
}

// ============ SERVICE ============

export const notificationsService = {
  /**
   * Get user's notifications
   * GET /api/notifications
   */
  async getAll(params?: {
    unread?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Notification[]>> {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notifications count
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ success: boolean; data: { count: number } }>(
      '/notifications/unread-count'
    );
    return response.data.data.count;
  },

  /**
   * Mark notification as read
   * POST /api/notifications/:id/read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await api.post(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   * POST /api/notifications/read-all
   */
  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   */
  async delete(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },

  /**
   * Get notification preferences
   * GET /api/notifications/preferences
   */
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    const response = await api.get<ApiResponse<NotificationPreferences>>(
      '/notifications/preferences'
    );
    return response.data;
  },

  /**
   * Update notification preferences
   * PATCH /api/notifications/preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> {
    const response = await api.patch<ApiResponse<NotificationPreferences>>(
      '/notifications/preferences',
      preferences
    );
    return response.data;
  },

  /**
   * Register push token for notifications
   * POST /api/notifications/push-token
   */
  async registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
    await api.post('/notifications/push-token', { token, platform });
  },
};

