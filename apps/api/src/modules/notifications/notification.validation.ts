import { z } from 'zod';

export const listNotificationsQuerySchema = z.object({
  cursor: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
});

export const notificationIdParamSchema = z.object({
  workspaceId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid workspace id'),
  notificationId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid notification id'),
});
