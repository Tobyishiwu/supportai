import { z } from 'zod';

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid workspace id'),
});

export const overviewQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(14),
});
