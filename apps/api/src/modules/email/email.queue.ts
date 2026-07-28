import { Queue } from 'bullmq';
import { bullRedis } from '../../db/redis.js';

export interface SendEmailJobData {
  to: string;
  subject: string;
  html: string;
}

export const emailQueue = new Queue<SendEmailJobData>('email-send', {
  connection: bullRedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  },
});

export async function enqueueEmail(data: SendEmailJobData): Promise<void> {
  await emailQueue.add('send-email', data);
}
