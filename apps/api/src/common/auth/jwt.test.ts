import { describe, expect, it } from 'vitest';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './jwt.js';

describe('access tokens', () => {
  it('round-trips the subject claim', () => {
    const token = signAccessToken({ sub: 'user-123' });
    expect(verifyAccessToken(token).sub).toBe('user-123');
  });

  it('rejects a token signed with a different secret', () => {
    const token = signRefreshToken({ sub: 'user-123', jti: 'jti-1' });
    expect(() => verifyAccessToken(token)).toThrow();
  });

  it('rejects a garbage token', () => {
    expect(() => verifyAccessToken('not-a-real-token')).toThrow();
  });
});

describe('refresh tokens', () => {
  it('round-trips the subject and jti claims', () => {
    const token = signRefreshToken({ sub: 'user-456', jti: 'jti-abc' });
    const payload = verifyRefreshToken(token);
    expect(payload.sub).toBe('user-456');
    expect(payload.jti).toBe('jti-abc');
  });

  it('rejects a token signed with a different secret', () => {
    const token = signAccessToken({ sub: 'user-456' });
    expect(() => verifyRefreshToken(token)).toThrow();
  });
});
