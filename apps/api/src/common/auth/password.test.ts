import { describe, expect, it } from 'vitest';
import { comparePassword, hashPassword } from './password.js';

describe('password hashing', () => {
  it('produces a hash different from the plaintext', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(hash).not.toBe('correct horse battery staple');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('round-trips: correct plaintext compares true', async () => {
    const hash = await hashPassword('correct horse battery staple');
    await expect(comparePassword('correct horse battery staple', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect plaintext', async () => {
    const hash = await hashPassword('correct horse battery staple');
    await expect(comparePassword('wrong password', hash)).resolves.toBe(false);
  });

  it('salts hashes so the same input hashes differently each time', async () => {
    const [a, b] = await Promise.all([hashPassword('same-input'), hashPassword('same-input')]);
    expect(a).not.toBe(b);
  });
});
