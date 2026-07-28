import { z } from 'zod';

export const workspaceSlugParamSchema = z.object({
  workspaceSlug: z.string().trim().min(1),
});

export const conversationIdParamSchema = workspaceSlugParamSchema.extend({
  conversationId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid conversation id'),
});

export const startChatSchema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
});

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});
