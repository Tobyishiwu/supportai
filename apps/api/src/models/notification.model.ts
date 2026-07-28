import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const notificationSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });
notificationSchema.plugin(toJSONPlugin);

export type NotificationDoc = HydratedDocument<InferSchemaType<typeof notificationSchema>>;
export const Notification = model('Notification', notificationSchema);
