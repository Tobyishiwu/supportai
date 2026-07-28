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

export async function connectRedis(): Promise<void> {
  await redis.connect();
  await bullRedis.connect();
  logger.info('Connected to Redis');
}

export async function disconnectRedis(): Promise<void> {
  redis.disconnect();
  bullRedis.disconnect();
}
