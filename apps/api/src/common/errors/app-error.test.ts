import { describe, expect, it } from 'vitest';
import { AppError } from './app-error.js';

describe('AppError factories', () => {
  it('validation() builds a 422 with details', () => {
    const err = AppError.validation('bad input', { field: 'email' });
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('bad input');
    expect(err.details).toEqual({ field: 'email' });
  });

  it('unauthorized() defaults to a standard message', () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.message).toBe('Authentication required');
  });

  it('forbidden() defaults to a standard message', () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('notFound() defaults to a standard message', () => {
    const err = AppError.notFound();
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('conflict() requires an explicit message', () => {
    const err = AppError.conflict('email already in use');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
    expect(err.message).toBe('email already in use');
  });

  it('rateLimited() defaults to a standard message', () => {
    const err = AppError.rateLimited();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMITED');
  });

  it('is an instanceof Error and carries the AppError name', () => {
    const err = AppError.notFound();
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('AppError');
  });
});
