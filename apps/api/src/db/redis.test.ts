import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { bullRedis, connectRedis, redis } from './redis.js';

describe('connectRedis', () => {
  it('does not throw when a client already auto-connected before this runs', async () => {
    // Building the app wires up BullMQ queues and the rate limiter's Redis
    // store, both of which send a command as soon as their modules load —
    // that auto-connects these lazyConnect clients before connectRedis() ever
    // explicitly calls .connect(), which used to throw
    // "Redis is already connecting/connected".
    createApp();
    expect(['connecting', 'connect', 'ready']).toContain(redis.status);

    await expect(connectRedis()).resolves.toBeUndefined();

    expect(redis.status).toBe('ready');
    expect(bullRedis.status).toBe('ready');
  });
});
