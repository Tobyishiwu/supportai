import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const ticketSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', default: null },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'] as const, default: 'medium' },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'] as const,
      default: 'open',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    category: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ticketSchema.plugin(toJSONPlugin);

export type TicketDoc = HydratedDocument<InferSchemaType<typeof ticketSchema>>;
export const Ticket = model('Ticket', ticketSchema);
