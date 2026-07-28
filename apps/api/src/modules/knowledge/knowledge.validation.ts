import { z } from 'zod';

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid workspace id'),
});

export const documentIdParamSchema = workspaceIdParamSchema.extend({
  documentId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid document id'),
});

export const createDocumentSchema = z.object({
  title: z.string().trim().min(2).max(150),
  sourceType: z.enum(['pdf', 'docx', 'txt', 'markdown', 'url']),
  sourceUrl: z.string().url().optional(),
});

export const createFaqSchema = z.object({
  title: z.string().trim().min(2).max(150),
  answer: z.string().trim().min(2).max(5000),
});
