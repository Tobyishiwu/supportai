import { apiClient } from '@/services/api-client';
import type { Customer } from './types';
import type { Conversation } from '@/features/inbox/types';

interface ApiEnvelope<T> {
  data: T;
}

export async function fetchCustomers(workspaceId: string, search?: string): Promise<Customer[]> {
  const res = await apiClient.get<ApiEnvelope<Customer[]>>(`/workspaces/${workspaceId}/customers`, {
    params: { search },
  });
  return res.data.data;
}

export async function fetchCustomer(
  workspaceId: string,
  customerId: string,
): Promise<{ customer: Customer; conversations: Conversation[] }> {
  const res = await apiClient.get<ApiEnvelope<{ customer: Customer; conversations: Conversation[] }>>(
    `/workspaces/${workspaceId}/customers/${customerId}`,
  );
  return res.data.data;
}
