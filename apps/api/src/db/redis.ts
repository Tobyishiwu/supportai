import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (error) => {
  logger.error({ err: error }, 'Redis connection error');
});

// BullMQ requires its own connection with maxRetriesPerRequest: null.
export const bullRedis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

bullRedis.on('error', (error) => {
  logger.error({ err: error }, 'BullMQ Redis connection error');
});

/**
 * `lazyConnect` delays the real connection until first use, not until this
 * function runs — BullMQ's Queue constructors and the rate limiter's Redis
 * store both send a command as soon as their modules are imported, which is
 * before this ever executes. Calling `.connect()` on a client ioredis has
 * already started connecting throws, so this waits for that in-flight
 * connection instead of duplicating it.
 */
async function ensureConnected(client: Redis): Promise<void> {
  if (client.status === 'wait' || client.status === 'end') {
    await client.connect();
    return;
  }
  if (client.status === 'ready') return;

  await new Promise<void>((resolve, reject) => {
    client.once('ready', resolve);
    client.once('error', reject);
  });
}

export async function connectRedis(): Promise<void> {
  await ensureConnected(redis);
  await ensureConnected(bullRedis);
  logger.info('Connected to Redis');
}

export async function disconnectRedis(): Promise<void> {
  redis.disconnect();
  bullRedis.disconnect();
}
