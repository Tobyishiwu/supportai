import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const knowledgeChunkSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    document: { type: Schema.Types.ObjectId, ref: 'KnowledgeDocument', required: true, index: true },
    content: { type: String, required: true },
    embedding: { type: [Number], default: undefined, select: false },
    tokenCount: { type: Number, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

knowledgeChunkSchema.index({ workspace: 1, document: 1, order: 1 });
knowledgeChunkSchema.plugin(toJSONPlugin);

export type KnowledgeChunkDoc = HydratedDocument<InferSchemaType<typeof knowledgeChunkSchema>>;
export const KnowledgeChunk = model('KnowledgeChunk', knowledgeChunkSchema);
