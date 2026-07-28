import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const workspaceMemberSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    status: { type: String, enum: ['invited', 'active', 'removed'] as const, default: 'invited' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    joinedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });
workspaceMemberSchema.plugin(toJSONPlugin);

export type WorkspaceMemberDoc = HydratedDocument<InferSchemaType<typeof workspaceMemberSchema>>;
export const WorkspaceMember = model('WorkspaceMember', workspaceMemberSchema);
