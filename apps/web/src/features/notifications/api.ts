import { apiClient } from '@/services/api-client';
import type { Notification } from './types';

interface ApiEnvelope<T> {
  data: T;
}

export async function fetchNotifications(workspaceId: string): Promise<Notification[]> {
  const res = await apiClient.get<ApiEnvelope<Notification[]>>(`/workspaces/${workspaceId}/notifications`);
  return res.data.data;
}

export async function fetchUnreadCount(workspaceId: string): Promise<number> {
  const res = await apiClient.get<ApiEnvelope<{ count: number }>>(
    `/workspaces/${workspaceId}/notifications/unread-count`,
  );
  return res.data.data.count;
}

export async function markNotificationRead(workspaceId: string, notificationId: string): Promise<void> {
  await apiClient.patch(`/workspaces/${workspaceId}/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(workspaceId: string): Promise<void> {
  await apiClient.patch(`/workspaces/${workspaceId}/notifications/read-all`);
}
