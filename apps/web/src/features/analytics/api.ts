import { apiClient } from '@/services/api-client';
import type { AnalyticsOverview } from './types';

interface ApiEnvelope<T> {
  data: T;
}

export async function fetchAnalyticsOverview(workspaceId: string, days = 14): Promise<AnalyticsOverview> {
  const res = await apiClient.get<ApiEnvelope<AnalyticsOverview>>(`/workspaces/${workspaceId}/analytics/overview`, {
    params: { days },
  });
  return res.data.data;
}

export async function triggerAnalyticsRollup(workspaceId: string): Promise<void> {
  await apiClient.post(`/workspaces/${workspaceId}/analytics/rollup`);
}
