import { apiClient } from '@/services/api-client';
import type { AISetting } from './types';

interface ApiEnvelope<T> {
  data: T;
}

export async function fetchAISettings(workspaceId: string): Promise<AISetting> {
  const res = await apiClient.get<ApiEnvelope<AISetting>>(`/workspaces/${workspaceId}/ai/settings`);
  return res.data.data;
}

export async function updateAISettings(
  workspaceId: string,
  updates: Partial<Omit<AISetting, 'id'>>,
): Promise<AISetting> {
  const res = await apiClient.patch<ApiEnvelope<AISetting>>(`/workspaces/${workspaceId}/ai/settings`, updates);
  return res.data.data;
}
