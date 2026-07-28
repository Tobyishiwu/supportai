import { z } from 'zod';
import { AI_PROVIDERS } from '../../../models/ai-setting.model.js';

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid workspace id'),
});

export const updateAISettingSchema = z.object({
  provider: z.enum(AI_PROVIDERS).optional(),
  model: z.string().trim().min(1).max(100).optional(),
  temperature: z.number().min(0).max(1).optional(),
  systemInstructions: z.string().trim().max(4000).optional(),
  fallbackMessage: z.string().trim().min(1).max(500).optional(),
  confidenceThreshold: z.number().min(0).max(1).optional(),
  enabledChannels: z.array(z.enum(['widget', 'email', 'api'])).optional(),
});
