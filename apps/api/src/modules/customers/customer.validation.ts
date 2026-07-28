import { z } from 'zod';

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid workspace id'),
});

export const customerIdParamSchema = workspaceIdParamSchema.extend({
  customerId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid customer id'),
});

export const listCustomersQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  cursor: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
});
