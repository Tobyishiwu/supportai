import { Queue } from 'bullmq';
import { bullRedis } from '../../../db/redis.js';

export interface ProcessDocumentJobData {
  documentId: string;
}

export const knowledgeQueue = new Queue<ProcessDocumentJobData>('knowledge-processing', {
  connection: bullRedis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  },
});

export async function enqueueDocumentProcessing(documentId: string): Promise<void> {
  await knowledgeQueue.add('process-document', { documentId });
}
