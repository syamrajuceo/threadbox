import { apiClient } from './client';

export interface Notification {
  id: string;
  type: 'assignment' | 'mention' | 'escalation' | 'status_change';
  title: string;
  message: string;
  relatedEmailId?: string;
  relatedProjectId?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: async (unreadOnly?: boolean): Promise<Notification[]> => {
    const params = unreadOnly ? '?unreadOnly=true' : '';
    const response = await apiClient.get<Notification[]>(
      `/notifications${params}`,
    );
    return response.data;
  },
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>(
      '/notifications/unread-count',
    );
    return response.data.count || 0;
  },
  markAsRead: async (id: string) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    return apiClient.patch('/notifications/mark-all-read');
  },
};

