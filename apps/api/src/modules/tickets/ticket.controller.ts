import type { Request, Response } from 'express';
import * as ticketService from './ticket.service.js';
import { recordAudit } from '../../common/utils/audit.js';

export async function list(req: Request, res: Response): Promise<void> {
  const { status, cursor } = req.query as Record<string, string | undefined>;
  const result = await ticketService.listTickets(req.workspaceId!, {
    status: status as 'open' | 'in_progress' | 'resolved' | 'closed' | undefined,
    cursor,
  });
  res.json({ data: result.data, pageInfo: { nextCursor: result.nextCursor, hasMore: result.nextCursor !== null } });
}

export async function get(req: Request, res: Response): Promise<void> {
  const ticket = await ticketService.getTicket(req.workspaceId!, req.params.ticketId!);
  res.json({ data: ticket });
}

export async function create(req: Request, res: Response): Promise<void> {
  const ticket = await ticketService.createTicket(req.workspaceId!, req.body);
  await recordAudit({
    req,
    action: 'ticket.create',
    workspace: req.workspaceId,
    actor: req.auth!.userId,
    targetType: 'Ticket',
    targetId: String(ticket._id),
  });
  res.status(201).json({ data: ticket });
}

export async function update(req: Request, res: Response): Promise<void> {
  const ticket = await ticketService.updateTicket(req.workspaceId!, req.params.ticketId!, req.body);
  await recordAudit({
    req,
    action: 'ticket.update',
    workspace: req.workspaceId,
    actor: req.auth!.userId,
    targetType: 'Ticket',
    targetId: req.params.ticketId,
    metadata: req.body,
  });
  res.json({ data: ticket });
}
