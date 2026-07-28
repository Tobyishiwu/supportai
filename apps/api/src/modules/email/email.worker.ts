import { Worker } from 'bullmq';
import { bullRedis } from '../../db/redis.js';
import { sendEmail } from '../../common/email/mailer.js';
import { logger } from '../../config/logger.js';
import type { SendEmailJobData } from './email.queue.js';

export function startEmailWorker(): Worker<SendEmailJobData> {
  const worker = new Worker<SendEmailJobData>('email-send', (job) => sendEmail(job.data), {
    connection: bullRedis,
    concurrency: 5,
  });

  worker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, 'Email send job failed permanently');
  });

  return worker;
}
