import { Queue } from 'bullmq';
import { bullRedis } from '../../db/redis.js';

export const analyticsQueue = new Queue('analytics-rollup', { connection: bullRedis });

/** Registers the nightly rollup as a BullMQ repeatable job. Idempotent — safe to call on every boot. */
export async function scheduleNightlyRollup(): Promise<void> {
  await analyticsQueue.add(
    'nightly-rollup',
    {},
    {
      repeat: { pattern: '0 1 * * *' },
      jobId: 'nightly-rollup',
    },
  );
}
