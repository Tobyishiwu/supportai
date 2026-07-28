import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i);

export const workspaceIdParamSchema = z.object({
  workspaceId: objectId,
});

export const ticketIdParamSchema = workspaceIdParamSchema.extend({
  ticketId: objectId,
});

export const listTicketsQuerySchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  cursor: objectId.optional(),
});

export const createTicketSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(4000).optional(),
  customerId: objectId,
  conversationId: objectId.optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().trim().max(60).optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(4000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  assignedTo: objectId.nullable().optional(),
  category: z.string().trim().max(60).nullable().optional(),
});
