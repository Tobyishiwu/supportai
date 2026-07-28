import { Worker } from 'bullmq';
import { bullRedis } from '../../../db/redis.js';
import { KnowledgeDocument } from '../../../models/knowledge-document.model.js';
import { KnowledgeChunk } from '../../../models/knowledge-chunk.model.js';
import { extractText } from '../extraction/index.js';
import { chunkText } from '../chunking.js';
import { getEmbeddingProvider } from '../../ai/providers/factory.js';
import { logger } from '../../../config/logger.js';
import type { ProcessDocumentJobData } from './knowledge.queue.js';

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download source file (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

async function processDocument(documentId: string): Promise<void> {
  const doc = await KnowledgeDocument.findById(documentId);
  if (!doc) return;

  doc.status = 'processing';
  doc.error = null;
  await doc.save();

  try {
    const buffer =
      doc.sourceType === 'url' || !doc.storageUrl ? undefined : await fetchBuffer(doc.storageUrl);

    const text = await extractText({ sourceType: doc.sourceType, buffer, sourceUrl: doc.sourceUrl });
    const chunks = chunkText(text);
    if (chunks.length === 0) throw new Error('No extractable text found in this document');

    const embeddingProvider = getEmbeddingProvider();
    const embeddings = await embeddingProvider.embed(chunks.map((c) => c.content));

    // Write new chunks before removing the old ones, so the AI never sees a knowledge gap mid-update.
    const staleChunkIds = (await KnowledgeChunk.find({ document: doc._id }, { _id: 1 })).map((c) => c._id);

    await KnowledgeChunk.insertMany(
      chunks.map((chunk, i) => ({
        workspace: doc.workspace,
        document: doc._id,
        content: chunk.content,
        embedding: embeddings[i],
        tokenCount: chunk.tokenCount,
        order: chunk.order,
      })),
    );

    if (staleChunkIds.length > 0) {
      await KnowledgeChunk.deleteMany({ _id: { $in: staleChunkIds } });
    }

    doc.status = 'ready';
    doc.chunkCount = chunks.length;
    await doc.save();
  } catch (error) {
    doc.status = 'failed';
    doc.error = error instanceof Error ? error.message : 'Unknown processing error';
    await doc.save();
    logger.error({ err: error, documentId }, 'Knowledge document processing failed');
  }
}

export function startKnowledgeWorker(): Worker<ProcessDocumentJobData> {
  const worker = new Worker<ProcessDocumentJobData>(
    'knowledge-processing',
    (job) => processDocument(job.data.documentId),
    { connection: bullRedis, concurrency: 2 },
  );

  worker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, 'Knowledge processing job failed permanently');
  });

  return worker;
}
