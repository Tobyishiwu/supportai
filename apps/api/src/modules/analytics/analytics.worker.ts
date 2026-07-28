import { Worker } from 'bullmq';
import { bullRedis } from '../../db/redis.js';
import { generateRollupForAllWorkspaces } from './analytics.service.js';
import { logger } from '../../config/logger.js';

export function startAnalyticsWorker(): Worker {
  const worker = new Worker(
    'analytics-rollup',
    async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await generateRollupForAllWorkspaces(yesterday);
    },
    { connection: bullRedis },
  );

  worker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, 'Analytics rollup job failed');
  });

  return worker;
}
