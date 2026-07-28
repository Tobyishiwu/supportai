import { randomUUID } from 'node:crypto';
import { redis } from '../../db/redis.js';

const TTL_SECONDS = 30 * 60;

function key(token: string): string {
  return `pwreset:${token}`;
}

/** The raw token is the secret (never stored/logged elsewhere) — same trust model as a refresh session's jti. */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = randomUUID();
  await redis.set(key(token), userId, 'EX', TTL_SECONDS);
  return token;
}

/** Single-use: deletes the token on read, valid or not, so a reset link can't be replayed. */
export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const userId = await redis.get(key(token));
  if (userId === null) return null;
  await redis.del(key(token));
  return userId;
}
