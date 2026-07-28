import { apiClient, setAccessToken } from '@/services/api-client';
import type { LoginPayload, RegisterPayload, User } from './types';

interface ApiEnvelope<T> {
  data: T;
}

export async function registerRequest(payload: RegisterPayload): Promise<User> {
  const res = await apiClient.post<ApiEnvelope<{ user: User; accessToken: string }>>(
    '/auth/register',
    payload,
  );
  setAccessToken(res.data.data.accessToken);
  return res.data.data.user;
}

export async function loginRequest(payload: LoginPayload): Promise<User> {
  const res = await apiClient.post<ApiEnvelope<{ user: User; accessToken: string }>>('/auth/login', payload);
  setAccessToken(res.data.data.accessToken);
  return res.data.data.user;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout');
  setAccessToken(null);
}

export async function fetchMe(): Promise<User> {
  const res = await apiClient.get<ApiEnvelope<{ user: User }>>('/auth/me');
  return res.data.data.user;
}

export async function refreshSession(): Promise<string> {
  const res = await apiClient.post<ApiEnvelope<{ accessToken: string }>>('/auth/refresh');
  setAccessToken(res.data.data.accessToken);
  return res.data.data.accessToken;
}
