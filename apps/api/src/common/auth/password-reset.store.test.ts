import { describe, expect, it } from 'vitest';
import { consumePasswordResetToken, createPasswordResetToken } from './password-reset.store.js';

describe('password reset token store', () => {
  it('round-trips: a freshly created token resolves to its userId', async () => {
    const token = await createPasswordResetToken('user-123');
    await expect(consumePasswordResetToken(token)).resolves.toBe('user-123');
  });

  it('is single-use: consuming the same token twice fails the second time', async () => {
    const token = await createPasswordResetToken('user-456');
    await consumePasswordResetToken(token);
    await expect(consumePasswordResetToken(token)).resolves.toBeNull();
  });

  it('rejects a token that was never issued', async () => {
    await expect(consumePasswordResetToken('never-issued')).resolves.toBeNull();
  });

  it('issues distinct tokens for distinct calls', async () => {
    const [a, b] = await Promise.all([
      createPasswordResetToken('user-789'),
      createPasswordResetToken('user-789'),
    ]);
    expect(a).not.toBe(b);
  });
});
