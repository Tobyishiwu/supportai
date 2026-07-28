import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { error?: { message?: string } } | undefined)?.error?.message;
    if (message) return message;
  }
  return fallback;
}
