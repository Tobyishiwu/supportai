import rateLimit from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import { redis } from '../../db/redis.js';
import { AppError } from '../errors/app-error.js';

const call = redis.call.bind(redis) as (...args: string[]) => Promise<RedisReply>;

function redisStore(prefix: string) {
  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => call(...args),
  });
}

export const globalRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore('rl:global:'),
  handler: (_req, _res, next) => next(AppError.rateLimited()),
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore('rl:auth:'),
  handler: (_req, _res, next) => next(AppError.rateLimited('Too many attempts. Please try again later.')),
});
