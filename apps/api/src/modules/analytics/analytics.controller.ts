import type { Request, Response } from 'express';
import * as analyticsService from './analytics.service.js';

export async function overview(req: Request, res: Response): Promise<void> {
  const { days } = req.query as unknown as { days: number };
  const result = await analyticsService.getOverview(req.workspaceId!, days);
  res.json({ data: result });
}

export async function triggerRollup(req: Request, res: Response): Promise<void> {
  const result = await analyticsService.generateRollupForDate(req.workspaceId!, new Date());
  res.status(201).json({ data: result });
}
