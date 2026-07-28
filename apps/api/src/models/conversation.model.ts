import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const conversationSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['open', 'pending', 'resolved', 'closed'] as const,
      default: 'open',
      index: true,
    },
    channel: { type: String, enum: ['widget', 'email', 'api'] as const, default: 'widget' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] as const, default: null },
    aiHandled: { type: Boolean, default: true },
    aiConfidence: { type: Number, default: null },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

conversationSchema.index({ workspace: 1, status: 1, lastMessageAt: -1 });
conversationSchema.plugin(toJSONPlugin);

export type ConversationDoc = HydratedDocument<InferSchemaType<typeof conversationSchema>>;
export const Conversation = model('Conversation', conversationSchema);
