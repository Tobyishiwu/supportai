import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const workspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    industry: { type: String, default: null },
    logoUrl: { type: String, default: null },
    timezone: { type: String, default: 'UTC' },
    billingEmail: { type: String, default: null },
    subscription: { type: Schema.Types.ObjectId, ref: 'Subscription', default: null },
    settings: {
      brandColor: { type: String, default: '#6366F1' },
      widgetGreeting: { type: String, default: "Hi! How can we help you today?" },
      businessHours: { type: String, default: null },
    },
  },
  { timestamps: true },
);

workspaceSchema.plugin(toJSONPlugin);

export type WorkspaceDoc = HydratedDocument<InferSchemaType<typeof workspaceSchema>>;
export const Workspace = model('Workspace', workspaceSchema);
