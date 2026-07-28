import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const auditLogSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null, index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true },
    targetType: { type: String, default: null },
    targetId: { type: Schema.Types.ObjectId, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.plugin(toJSONPlugin);

export type AuditLogDoc = HydratedDocument<InferSchemaType<typeof auditLogSchema>>;
export const AuditLog = model('AuditLog', auditLogSchema);
