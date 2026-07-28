import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/** Called once, by the auth provider, so the API client can react to an unrecoverable 401. */
export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export const apiClient = axios.create({ baseURL, withCredentials: true });

// Bare client for the refresh call itself — must never go through the response
// interceptor below, or a failed refresh would recurse into another refresh attempt.
const refreshClient = axios.create({ baseURL, withCredentials: true });

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  refreshPromise ??= refreshClient
    .post<{ data: { accessToken: string } }>('/auth/refresh')
    .then((res) => res.data.data.accessToken)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthEndpoint = original?.url?.startsWith('/auth/');

    if (error.response?.status !== 401 || !original || original._retried || isAuthEndpoint) {
      throw error;
    }

    try {
      original._retried = true;
      const newToken = await refreshAccessToken();
      setAccessToken(newToken);
      original.headers.set('Authorization', `Bearer ${newToken}`);
      return apiClient(original);
    } catch (refreshError) {
      setAccessToken(null);
      onUnauthorized?.();
      throw refreshError;
    }
  },
);
