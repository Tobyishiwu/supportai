import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const apiKeySchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true },
    keyHash: { type: String, required: true, select: false },
    prefix: { type: String, required: true },
    scopes: { type: [String], default: [] },
    lastUsedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

apiKeySchema.plugin(toJSONPlugin);

export type APIKeyDoc = HydratedDocument<InferSchemaType<typeof apiKeySchema>>;
export const APIKey = model('APIKey', apiKeySchema);
