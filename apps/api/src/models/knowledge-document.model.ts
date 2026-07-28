import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const knowledgeDocumentSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true },
    sourceType: { type: String, enum: ['pdf', 'docx', 'txt', 'markdown', 'url', 'faq'] as const, required: true },
    sourceUrl: { type: String, default: null },
    storageUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed'] as const,
      default: 'pending',
      index: true,
    },
    error: { type: String, default: null },
    chunkCount: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

knowledgeDocumentSchema.plugin(toJSONPlugin);

export type KnowledgeDocumentDoc = HydratedDocument<InferSchemaType<typeof knowledgeDocumentSchema>>;
export const KnowledgeDocument = model('KnowledgeDocument', knowledgeDocumentSchema);
