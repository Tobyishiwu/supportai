import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import { redis } from '../../db/redis.js';

/**
 * Reports real dependency health, not just "the process is running" — Render
 * (and any orchestrator) should be able to tell a degraded instance from a
 * healthy one.
 */
export function healthCheck(_req: Request, res: Response): void {
  const mongoConnected = mongoose.connection.readyState === 1;
  const redisConnected = redis.status === 'ready';
  const healthy = mongoConnected && redisConnected;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    dependencies: {
      mongo: mongoConnected ? 'connected' : 'disconnected',
      redis: redisConnected ? 'connected' : 'disconnected',
    },
  });
}
