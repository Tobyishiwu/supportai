import { z } from 'zod';

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid workspace id'),
});

export const conversationIdParamSchema = workspaceIdParamSchema.extend({
  conversationId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid conversation id'),
});

export const listConversationsQuerySchema = z.object({
  status: z.enum(['open', 'pending', 'resolved', 'closed']).optional(),
  assignedTo: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  tag: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  cursor: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
});

export const updateConversationSchema = z.object({
  assignedTo: z.string().regex(/^[a-f0-9]{24}$/i).nullable().optional(),
  status: z.enum(['open', 'pending', 'resolved', 'closed']).optional(),
  tags: z.array(z.string().regex(/^[a-f0-9]{24}$/i)).optional(),
});

export const createMessageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  isInternalNote: z.boolean().optional().default(false),
});
