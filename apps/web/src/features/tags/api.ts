import { apiClient } from '@/services/api-client';
import type { InboxTag } from '@/features/inbox/types';

interface ApiEnvelope<T> {
  data: T;
}

export async function fetchTags(workspaceId: string): Promise<InboxTag[]> {
  const res = await apiClient.get<ApiEnvelope<InboxTag[]>>(`/workspaces/${workspaceId}/tags`);
  return res.data.data;
}

export async function createTag(workspaceId: string, input: { name: string; color?: string }): Promise<InboxTag> {
  const res = await apiClient.post<ApiEnvelope<InboxTag>>(`/workspaces/${workspaceId}/tags`, input);
  return res.data.data;
}
