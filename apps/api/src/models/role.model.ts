import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

export const SYSTEM_ROLES = ['owner', 'agent'] as const;
export type SystemRoleName = (typeof SYSTEM_ROLES)[number];

const roleSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null, index: true },
    name: { type: String, required: true, trim: true },
    isSystem: { type: Boolean, default: false },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
  },
  { timestamps: true },
);

roleSchema.index({ workspace: 1, name: 1 }, { unique: true });
roleSchema.plugin(toJSONPlugin);

export type RoleDoc = HydratedDocument<InferSchemaType<typeof roleSchema>>;
export const Role = model('Role', roleSchema);
