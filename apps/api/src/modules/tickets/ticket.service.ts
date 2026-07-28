import { Types } from 'mongoose';
import { Ticket, type TicketDoc } from '../../models/ticket.model.js';
import { AppError } from '../../common/errors/app-error.js';

const PAGE_SIZE = 20;

export async function listTickets(
  workspaceId: string,
  filters: { status?: TicketDoc['status']; cursor?: string },
): Promise<{ data: TicketDoc[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = { workspace: workspaceId, deletedAt: null };
  if (filters.status) filter.status = filters.status;
  if (filters.cursor) filter._id = { $lt: filters.cursor };

  const tickets = await Ticket.find(filter)
    .populate('customer', 'name email')
    .populate('assignedTo', 'name email avatarUrl')
    .sort({ _id: -1 })
    .limit(PAGE_SIZE + 1);

  const hasMore = tickets.length > PAGE_SIZE;
  const page = hasMore ? tickets.slice(0, PAGE_SIZE) : tickets;
  const last = page.at(-1);

  return { data: page, nextCursor: hasMore && last ? String(last._id) : null };
}

export async function getTicket(workspaceId: string, ticketId: string): Promise<TicketDoc> {
  const ticket = await Ticket.findOne({ _id: ticketId, workspace: workspaceId, deletedAt: null })
    .populate('customer', 'name email')
    .populate('assignedTo', 'name email avatarUrl');
  if (!ticket) throw AppError.notFound('Ticket not found');
  return ticket;
}

export async function createTicket(
  workspaceId: string,
  input: {
    title: string;
    description?: string;
    customerId: string;
    conversationId?: string;
    priority?: TicketDoc['priority'];
    category?: string;
  },
): Promise<TicketDoc> {
  const ticket = await Ticket.create({
    workspace: workspaceId,
    customer: input.customerId,
    conversation: input.conversationId ?? null,
    title: input.title,
    description: input.description ?? '',
    priority: input.priority,
    category: input.category ?? null,
  });
  return ticket.populate([
    { path: 'customer', select: 'name email' },
    { path: 'assignedTo', select: 'name email avatarUrl' },
  ]);
}

export async function updateTicket(
  workspaceId: string,
  ticketId: string,
  updates: {
    title?: string;
    description?: string;
    priority?: TicketDoc['priority'];
    status?: TicketDoc['status'];
    assignedTo?: string | null;
    category?: string | null;
  },
): Promise<TicketDoc> {
  const ticket = await Ticket.findOne({ _id: ticketId, workspace: workspaceId, deletedAt: null });
  if (!ticket) throw AppError.notFound('Ticket not found');

  if (updates.title !== undefined) ticket.title = updates.title;
  if (updates.description !== undefined) ticket.description = updates.description;
  if (updates.priority !== undefined) ticket.priority = updates.priority;
  if (updates.status !== undefined) ticket.status = updates.status;
  if (updates.category !== undefined) ticket.category = updates.category;
  if (updates.assignedTo !== undefined) {
    ticket.assignedTo = updates.assignedTo ? new Types.ObjectId(updates.assignedTo) : null;
  }

  await ticket.save();
  return ticket.populate([
    { path: 'customer', select: 'name email' },
    { path: 'assignedTo', select: 'name email avatarUrl' },
  ]);
}
