import { apiClient } from '@/services/api-client';
import type { Ticket, TicketPriority, TicketStatus } from './types';

interface ApiEnvelope<T> {
  data: T;
}

export async function fetchTickets(workspaceId: string, status?: TicketStatus): Promise<Ticket[]> {
  const res = await apiClient.get<ApiEnvelope<Ticket[]>>(`/workspaces/${workspaceId}/tickets`, {
    params: { status },
  });
  return res.data.data;
}

export async function createTicket(
  workspaceId: string,
  input: {
    title: string;
    description?: string;
    customerId: string;
    priority?: TicketPriority;
    category?: string;
  },
): Promise<Ticket> {
  const res = await apiClient.post<ApiEnvelope<Ticket>>(`/workspaces/${workspaceId}/tickets`, input);
  return res.data.data;
}

export async function updateTicket(
  workspaceId: string,
  ticketId: string,
  updates: { status?: TicketStatus; priority?: TicketPriority },
): Promise<Ticket> {
  const res = await apiClient.patch<ApiEnvelope<Ticket>>(`/workspaces/${workspaceId}/tickets/${ticketId}`, updates);
  return res.data.data;
}
