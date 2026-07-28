import type { Request, Response } from 'express';
import * as copilotService from './copilot.service.js';

export async function analyze(req: Request, res: Response): Promise<void> {
  const result = await copilotService.analyzeConversation(req.workspaceId!, req.params.conversationId!);
  res.json({ data: result });
}

export async function suggestReply(req: Request, res: Response): Promise<void> {
  const result = await copilotService.suggestReply(req.workspaceId!, req.params.conversationId!);
  res.json({ data: result });
}
