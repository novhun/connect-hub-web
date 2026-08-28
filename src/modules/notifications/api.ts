import { api } from '../../services/api';
import { NotificationItem } from './types';

export const notificationsApi = {
  getNotifications: (): Promise<NotificationItem[]> => {
    return api.getNotifications();
  },
  markRead: (id: string): Promise<{ success: boolean }> => {
    return api.markNotificationRead(id);
  },
  markAllRead: (): Promise<{ success: boolean }> => {
    return api.markAllNotificationsRead();
  },
};
