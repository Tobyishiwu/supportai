import { apiClient } from '@/services/api-client';
import type { Workspace, WorkspaceMembership } from '@/features/auth/types';
import type { Invite, Member, Role } from './types';

interface ApiEnvelope<T> {
  data: T;
}

export async function fetchMyWorkspaces(): Promise<WorkspaceMembership[]> {
  const res = await apiClient.get<ApiEnvelope<WorkspaceMembership[]>>('/workspaces');
  return res.data.data;
}

export async function fetchWorkspace(workspaceId: string): Promise<Workspace> {
  const res = await apiClient.get<ApiEnvelope<Workspace>>(`/workspaces/${workspaceId}`);
  return res.data.data;
}

export async function updateWorkspace(
  workspaceId: string,
  input: { name?: string; industry?: string },
): Promise<Workspace> {
  const res = await apiClient.patch<ApiEnvelope<Workspace>>(`/workspaces/${workspaceId}`, input);
  return res.data.data;
}

export async function fetchMembers(workspaceId: string): Promise<Member[]> {
  const res = await apiClient.get<ApiEnvelope<Member[]>>(`/workspaces/${workspaceId}/members`);
  return res.data.data;
}

export async function fetchRoles(workspaceId: string): Promise<Role[]> {
  const res = await apiClient.get<ApiEnvelope<Role[]>>(`/workspaces/${workspaceId}/roles`);
  return res.data.data;
}

export async function inviteMember(
  workspaceId: string,
  input: { email: string; roleName: string },
): Promise<Member> {
  const res = await apiClient.post<ApiEnvelope<Member>>(`/workspaces/${workspaceId}/members/invite`, input);
  return res.data.data;
}

export async function removeMember(workspaceId: string, memberId: string): Promise<void> {
  await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
}

export async function fetchMyInvites(): Promise<Invite[]> {
  const res = await apiClient.get<ApiEnvelope<Invite[]>>('/workspaces/invites');
  return res.data.data;
}

export async function acceptInvite(workspaceId: string): Promise<void> {
  await apiClient.post(`/workspaces/${workspaceId}/members/accept`);
}
