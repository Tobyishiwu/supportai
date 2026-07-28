import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i);

export const copilotParamsSchema = z.object({
  workspaceId: objectId,
  conversationId: objectId,
});
