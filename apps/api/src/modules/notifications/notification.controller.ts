import type { Request, Response } from 'express';
import * as notificationService from './notification.service.js';

export async function list(req: Request, res: Response): Promise<void> {
  const cursor = req.query.cursor as string | undefined;
  const result = await notificationService.listNotifications(req.workspaceId!, req.auth!.userId, cursor);
  res.json({ data: result.data, pageInfo: { nextCursor: result.nextCursor, hasMore: result.nextCursor !== null } });
}

export async function unreadCount(req: Request, res: Response): Promise<void> {
  const count = await notificationService.countUnread(req.workspaceId!, req.auth!.userId);
  res.json({ data: { count } });
}

export async function markRead(req: Request, res: Response): Promise<void> {
  await notificationService.markRead(req.workspaceId!, req.auth!.userId, req.params.notificationId!);
  res.status(204).send();
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  await notificationService.markAllRead(req.workspaceId!, req.auth!.userId);
  res.status(204).send();
}
