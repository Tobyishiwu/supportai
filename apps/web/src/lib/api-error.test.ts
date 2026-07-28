import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { getApiErrorMessage } from './api-error';

function axiosErrorWithMessage(message: string): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    data: { error: { message } },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: error.config!,
  };
  return error;
}

describe('getApiErrorMessage', () => {
  it('extracts the server-provided message from an axios error', () => {
    expect(getApiErrorMessage(axiosErrorWithMessage('Email already in use'))).toBe(
      'Email already in use',
    );
  });

  it('falls back to the default message for a non-axios error', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('Something went wrong. Please try again.');
  });

  it('falls back to a custom message when provided', () => {
    expect(getApiErrorMessage(new Error('boom'), 'Custom fallback')).toBe('Custom fallback');
  });

  it('falls back when the axios error has no response body message', () => {
    const error = new AxiosError('Network Error');
    expect(getApiErrorMessage(error, 'Network issue')).toBe('Network issue');
  });
});
