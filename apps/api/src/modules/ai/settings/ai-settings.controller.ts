import type { Request, Response } from 'express';
import * as aiSettingsService from './ai-settings.service.js';
import { recordAudit } from '../../../common/utils/audit.js';

export async function getSettings(req: Request, res: Response): Promise<void> {
  const setting = await aiSettingsService.getAISetting(req.workspaceId!);
  res.json({ data: setting });
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const setting = await aiSettingsService.updateAISetting(req.workspaceId!, req.body);
  await recordAudit({
    req,
    action: 'ai.settings.update',
    workspace: req.workspaceId,
    actor: req.auth!.userId,
    targetType: 'AISetting',
    targetId: String(setting._id),
    metadata: { fields: Object.keys(req.body) },
  });
  res.json({ data: setting });
}
