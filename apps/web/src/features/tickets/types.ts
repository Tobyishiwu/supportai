export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: string | null;
  customer: { id: string; name: string | null; email: string | null };
  assignedTo: { id: string; name: string; email: string; avatarUrl: string | null } | null;
  createdAt: string;
}
