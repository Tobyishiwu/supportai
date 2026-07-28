import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const customerSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, default: null },
    email: { type: String, default: null, lowercase: true, trim: true },
    phone: { type: String, default: null },
    externalId: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

customerSchema.index({ workspace: 1, email: 1 });
customerSchema.plugin(toJSONPlugin);

export type CustomerDoc = HydratedDocument<InferSchemaType<typeof customerSchema>>;
export const Customer = model('Customer', customerSchema);
