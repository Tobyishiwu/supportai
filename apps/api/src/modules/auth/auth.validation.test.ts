import { describe, expect, it } from 'vitest';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './auth.validation.js';

describe('registerSchema', () => {
  const valid = {
    name: 'Jane Doe',
    email: 'Jane@Example.com',
    password: 'password123',
    workspaceName: 'Acme Co',
  };

  it('accepts a valid payload and normalizes email casing', () => {
    const result = registerSchema.parse(valid);
    expect(result.email).toBe('jane@example.com');
  });

  it('trims the name and workspace name', () => {
    const result = registerSchema.parse({ ...valid, name: '  Jane Doe  ' });
    expect(result.name).toBe('Jane Doe');
  });

  it('rejects an invalid email', () => {
    expect(() => registerSchema.parse({ ...valid, email: 'not-an-email' })).toThrow();
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(() => registerSchema.parse({ ...valid, password: 'short' })).toThrow();
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(() => registerSchema.parse({ ...valid, name: 'J' })).toThrow();
  });

  it('allows industry to be omitted', () => {
    expect(() => registerSchema.parse(valid)).not.toThrow();
  });
});

describe('loginSchema', () => {
  it('accepts a valid payload', () => {
    expect(() =>
      loginSchema.parse({ email: 'jane@example.com', password: 'anything' }),
    ).not.toThrow();
  });

  it('rejects an empty password', () => {
    expect(() => loginSchema.parse({ email: 'jane@example.com', password: '' })).toThrow();
  });

  it('rejects a malformed email', () => {
    expect(() => loginSchema.parse({ email: 'nope', password: 'x' })).toThrow();
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts a valid email and normalizes casing', () => {
    expect(forgotPasswordSchema.parse({ email: 'Jane@Example.com' }).email).toBe('jane@example.com');
  });

  it('rejects a malformed email', () => {
    expect(() => forgotPasswordSchema.parse({ email: 'nope' })).toThrow();
  });
});

describe('resetPasswordSchema', () => {
  it('accepts a valid token and password', () => {
    expect(() =>
      resetPasswordSchema.parse({ token: 'some-token', password: 'password123' }),
    ).not.toThrow();
  });

  it('rejects an empty token', () => {
    expect(() => resetPasswordSchema.parse({ token: '', password: 'password123' })).toThrow();
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(() => resetPasswordSchema.parse({ token: 'some-token', password: 'short' })).toThrow();
  });
});
