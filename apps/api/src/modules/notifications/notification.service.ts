import { Notification, type NotificationDoc } from '../../models/notification.model.js';
import { AppError } from '../../common/errors/app-error.js';

const PAGE_SIZE = 20;

export async function listNotifications(
  workspaceId: string,
  userId: string,
  cursor?: string,
): Promise<{ data: NotificationDoc[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = { workspace: workspaceId, user: userId };
  if (cursor) filter._id = { $lt: cursor };

  const notifications = await Notification.find(filter)
    .sort({ _id: -1 })
    .limit(PAGE_SIZE + 1);

  const hasMore = notifications.length > PAGE_SIZE;
  const page = hasMore ? notifications.slice(0, PAGE_SIZE) : notifications;
  const last = page.at(-1);

  return {
    data: page,
    nextCursor: hasMore && last ? String(last._id) : null,
  };
}

export async function countUnread(workspaceId: string, userId: string): Promise<number> {
  return Notification.countDocuments({ workspace: workspaceId, user: userId, readAt: null });
}

export async function markRead(workspaceId: string, userId: string, notificationId: string): Promise<void> {
  const result = await Notification.updateOne(
    { _id: notificationId, workspace: workspaceId, user: userId },
    { readAt: new Date() },
  );
  if (result.matchedCount === 0) throw AppError.notFound('Notification not found');
}

export async function markAllRead(workspaceId: string, userId: string): Promise<void> {
  await Notification.updateMany(
    { workspace: workspaceId, user: userId, readAt: null },
    { readAt: new Date() },
  );
}
