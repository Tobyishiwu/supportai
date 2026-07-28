import { apiClient } from '@/services/api-client';

interface ApiEnvelope<T> {
  data: T;
}

export interface ConversationAnalysis {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
}

export interface SuggestedReply {
  suggestion: string;
  usedArticles: { id: string; title: string }[];
}

export async function analyzeConversation(workspaceId: string, conversationId: string): Promise<ConversationAnalysis> {
  const res = await apiClient.post<ApiEnvelope<ConversationAnalysis>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/copilot/analyze`,
  );
  return res.data.data;
}

export async function suggestReply(workspaceId: string, conversationId: string): Promise<SuggestedReply> {
  const res = await apiClient.post<ApiEnvelope<SuggestedReply>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/copilot/suggest-reply`,
  );
  return res.data.data;
}
