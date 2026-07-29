import { Types } from 'mongoose';
import { KnowledgeDocument, type KnowledgeDocumentDoc } from '../../models/knowledge-document.model.js';
import { KnowledgeChunk } from '../../models/knowledge-chunk.model.js';
import { AppError } from '../../common/errors/app-error.js';
import { uploadBuffer } from '../../common/storage/cloudinary.js';
import { chunkText } from './chunking.js';
import { getEmbeddingProvider } from '../ai/providers/factory.js';
import { enqueueDocumentProcessing } from './queue/knowledge.queue.js';
import { env } from '../../config/env.js';

const FILE_SOURCE_TYPES = ['pdf', 'docx', 'txt', 'markdown'] as const;

interface CreateDocumentInput {
  workspaceId: string;
  uploadedBy: string;
  title: string;
  sourceType: 'pdf' | 'docx' | 'txt' | 'markdown' | 'url';
  sourceUrl?: string;
  file?: { buffer: Buffer; originalName: string };
}

export async function createDocument(input: CreateDocumentInput): Promise<KnowledgeDocumentDoc> {
  const isFileType = (FILE_SOURCE_TYPES as readonly string[]).includes(input.sourceType);

  if (isFileType && !input.file) {
    throw AppError.validation(`A file is required for source type "${input.sourceType}"`);
  }
  if (input.sourceType === 'url' && !input.sourceUrl) {
    throw AppError.validation('A URL is required for source type "url"');
  }

  let storageUrl: string | null = null;
  if (input.file) {
    const uploaded = await uploadBuffer(input.file.buffer, {
      folder: `supportai/${input.workspaceId}/knowledge`,
      filename: input.file.originalName,
    });
    storageUrl = uploaded.url;
  }

  const doc = await KnowledgeDocument.create({
    workspace: input.workspaceId,
    title: input.title,
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl ?? null,
    storageUrl,
    status: 'pending',
    uploadedBy: input.uploadedBy,
  });

  await enqueueDocumentProcessing(String(doc._id));
  return doc;
}

export async function createFaq(input: {
  workspaceId: string;
  uploadedBy: string;
  title: string;
  answer: string;
}): Promise<KnowledgeDocumentDoc> {
  const doc = await KnowledgeDocument.create({
    workspace: input.workspaceId,
    title: input.title,
    sourceType: 'faq',
    status: 'processing',
    uploadedBy: input.uploadedBy,
  });

  try {
    const chunks = chunkText(input.answer);
    const embeddingProvider = getEmbeddingProvider();
    const embeddings = await embeddingProvider.embed(chunks.map((c) => c.content));

    await KnowledgeChunk.insertMany(
      chunks.map((chunk, i) => ({
        workspace: input.workspaceId,
        document: doc._id,
        content: chunk.content,
        embedding: embeddings[i],
        tokenCount: chunk.tokenCount,
        order: chunk.order,
      })),
    );

    doc.status = 'ready';
    doc.chunkCount = chunks.length;
    await doc.save();
  } catch (error) {
    doc.status = 'failed';
    doc.error = error instanceof Error ? error.message : 'Unknown processing error';
    await doc.save();
  }

  return doc;
}

export async function listDocuments(workspaceId: string): Promise<KnowledgeDocumentDoc[]> {
  return KnowledgeDocument.find({ workspace: workspaceId, deletedAt: null })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
}

export async function deleteDocument(workspaceId: string, documentId: string): Promise<void> {
  const doc = await KnowledgeDocument.findOne({ _id: documentId, workspace: workspaceId, deletedAt: null });
  if (!doc) throw AppError.notFound('Document not found');

  await KnowledgeChunk.deleteMany({ document: doc._id });
  doc.deletedAt = new Date();
  await doc.save();
}

/**
 * Retrieves the top-K most relevant chunks for a query embedding, scoped to
 * the workspace. Requires an Atlas Search vector index named
 * "knowledge_vector_index" on KnowledgeChunk.embedding (see
 * docs/database-design.md) — used by the Phase 4 AI orchestration layer.
 */
export interface RetrievedChunk {
  _id: Types.ObjectId;
  content: string;
  document: Types.ObjectId;
  score: number;
}

export async function retrieveRelevantChunks(
  workspaceId: string,
  queryEmbedding: number[],
  limit = 5,
): Promise<RetrievedChunk[]> {
  return KnowledgeChunk.aggregate<RetrievedChunk>([
    {
      $vectorSearch: {
        index: env.KNOWLEDGE_VECTOR_INDEX,
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: limit * 20,
        limit,
        filter: { workspace: new Types.ObjectId(workspaceId) },
      },
    },
    { $project: { content: 1, document: 1, score: { $meta: 'vectorSearchScore' } } },
  ]);
}
