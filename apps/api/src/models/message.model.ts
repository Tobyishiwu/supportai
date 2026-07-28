import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const messageSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: String, enum: ['customer', 'ai', 'agent'] as const, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    body: { type: String, required: true },
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],
    isInternalNote: { type: Boolean, default: false },
    aiMeta: {
      provider: { type: String, default: null },
      model: { type: String, default: null },
      usedChunks: [{ type: Schema.Types.ObjectId, ref: 'KnowledgeChunk' }],
      confidence: { type: Number, default: null },
    },
  },
  { timestamps: true },
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.plugin(toJSONPlugin);

export type MessageDoc = HydratedDocument<InferSchemaType<typeof messageSchema>>;
export const Message = model('Message', messageSchema);
