import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const tagSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#6366F1' },
  },
  { timestamps: true },
);

tagSchema.index({ workspace: 1, name: 1 }, { unique: true });
tagSchema.plugin(toJSONPlugin);

export type TagDoc = HydratedDocument<InferSchemaType<typeof tagSchema>>;
export const Tag = model('Tag', tagSchema);
