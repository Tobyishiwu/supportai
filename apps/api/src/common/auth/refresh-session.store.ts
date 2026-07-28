import { randomUUID } from 'node:crypto';
import { redis } from '../../db/redis.js';
import { env } from '../../config/env.js';
import { parseDurationToSeconds } from '../utils/duration.js';

const ttlSeconds = parseDurationToSeconds(env.JWT_REFRESH_TTL);

function key(userId: string, jti: string): string {
  return `refresh:${userId}:${jti}`;
}

/** Creates a new refresh session and returns its jti. One key per device/session. */
export async function createRefreshSession(userId: string): Promise<string> {
  const jti = randomUUID();
  await redis.set(key(userId, jti), '1', 'EX', ttlSeconds);
  return jti;
}

export async function isRefreshSessionValid(userId: string, jti: string): Promise<boolean> {
  const value = await redis.get(key(userId, jti));
  return value !== null;
}

export async function revokeRefreshSession(userId: string, jti: string): Promise<void> {
  await redis.del(key(userId, jti));
}

/** Rotation: invalidate the old session and issue a new one atomically enough for our threat model. */
export async function rotateRefreshSession(userId: string, oldJti: string): Promise<string> {
  await revokeRefreshSession(userId, oldJti);
  return createRefreshSession(userId);
}

/** Logs out every device/session for a user — used after a password reset. */
export async function revokeAllRefreshSessions(userId: string): Promise<void> {
  const keys = await redis.keys(`refresh:${userId}:*`);
  if (keys.length > 0) await redis.del(...keys);
}
