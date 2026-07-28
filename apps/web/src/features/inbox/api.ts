import { apiClient } from '@/services/api-client';
import type { Conversation, ConversationStatus, Message } from './types';

interface ApiEnvelope<T> {
  data: T;
}

export async function fetchConversations(
  workspaceId: string,
  filters: { status?: ConversationStatus; assignedTo?: string },
): Promise<Conversation[]> {
  const res = await apiClient.get<ApiEnvelope<Conversation[]>>(`/workspaces/${workspaceId}/conversations`, {
    params: filters,
  });
  return res.data.data;
}

export async function fetchConversation(
  workspaceId: string,
  conversationId: string,
): Promise<{ conversation: Conversation; messages: Message[] }> {
  const res = await apiClient.get<ApiEnvelope<{ conversation: Conversation; messages: Message[] }>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}`,
  );
  return res.data.data;
}

export async function updateConversation(
  workspaceId: string,
  conversationId: string,
  updates: { assignedTo?: string | null; status?: ConversationStatus; tags?: string[] },
): Promise<Conversation> {
  const res = await apiClient.patch<ApiEnvelope<Conversation>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}`,
    updates,
  );
  return res.data.data;
}

export async function sendAgentMessage(
  workspaceId: string,
  conversationId: string,
  input: { body: string; isInternalNote: boolean },
): Promise<Message> {
  const res = await apiClient.post<ApiEnvelope<Message>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/messages`,
    input,
  );
  return res.data.data;
}

export async function forceHandoff(workspaceId: string, conversationId: string): Promise<Conversation> {
  const res = await apiClient.post<ApiEnvelope<Conversation>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/handoff`,
  );
  return res.data.data;
}
