export interface InboxUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface InboxCustomer {
  id: string;
  name: string | null;
  email: string | null;
  phone?: string | null;
}

export interface InboxTag {
  id: string;
  name: string;
  color: string;
}

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed';

export interface Conversation {
  id: string;
  customer: InboxCustomer;
  assignedTo: InboxUser | null;
  status: ConversationStatus;
  channel: 'widget' | 'email' | 'api';
  tags: InboxTag[];
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  aiHandled: boolean;
  aiConfidence: number | null;
  lastMessageAt: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: 'customer' | 'ai' | 'agent';
  author: InboxUser | null;
  body: string;
  isInternalNote: boolean;
  aiMeta: { provider: string | null; model: string | null; confidence: number | null };
  createdAt: string;
}
