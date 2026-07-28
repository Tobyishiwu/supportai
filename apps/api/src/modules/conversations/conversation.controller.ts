import type { Request, Response } from 'express';
import * as conversationService from './conversation.service.js';
import { recordAudit } from '../../common/utils/audit.js';
import { broadcastToWorkspace } from '../../realtime/socket.js';

export async function list(req: Request, res: Response): Promise<void> {
  const { status, assignedTo, tag, cursor } = req.query as Record<string, string | undefined>;
  const result = await conversationService.listConversations(req.workspaceId!, {
    status: status as 'open' | 'pending' | 'resolved' | 'closed' | undefined,
    assignedTo,
    tag,
    cursor,
  });
  res.json({ data: result.data, pageInfo: { nextCursor: result.nextCursor, hasMore: result.nextCursor !== null } });
}

export async function get(req: Request, res: Response): Promise<void> {
  const result = await conversationService.getConversation(req.workspaceId!, req.params.conversationId!);
  res.json({ data: result });
}

export async function update(req: Request, res: Response): Promise<void> {
  const conversation = await conversationService.updateConversation(
    req.workspaceId!,
    req.params.conversationId!,
    req.body,
  );
  await recordAudit({
    req,
    action: 'conversation.update',
    workspace: req.workspaceId,
    actor: req.auth!.userId,
    targetType: 'Conversation',
    targetId: req.params.conversationId,
    metadata: req.body,
  });
  broadcastToWorkspace(req.workspaceId!, 'conversation:updated', { conversationId: req.params.conversationId });
  res.json({ data: conversation });
}

export async function createMessage(req: Request, res: Response): Promise<void> {
  const message = await conversationService.createAgentMessage(
    req.workspaceId!,
    req.params.conversationId!,
    req.auth!.userId,
    req.body.body,
    req.body.isInternalNote,
  );
  broadcastToWorkspace(req.workspaceId!, 'message:created', {
    conversationId: req.params.conversationId,
    message,
  });
  res.status(201).json({ data: message });
}

export async function handoff(req: Request, res: Response): Promise<void> {
  const conversation = await conversationService.forceHandoff(req.workspaceId!, req.params.conversationId!);
  broadcastToWorkspace(req.workspaceId!, 'conversation:updated', { conversationId: req.params.conversationId });
  res.json({ data: conversation });
}
