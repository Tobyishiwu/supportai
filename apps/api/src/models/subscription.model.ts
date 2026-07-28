import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const subscriptionSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, unique: true, index: true },
    plan: { type: String, enum: ['free', 'starter', 'growth', 'enterprise'] as const, default: 'free' },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled'] as const,
      default: 'trialing',
    },
    seats: { type: Number, default: 1 },
    messageQuota: { type: Number, default: 500 },
    currentPeriodEnd: { type: Date, default: null },
    provider: { type: String, enum: ['stripe'] as const, default: 'stripe' },
    providerCustomerId: { type: String, default: null },
    providerSubscriptionId: { type: String, default: null },
  },
  { timestamps: true },
);

subscriptionSchema.plugin(toJSONPlugin);

export type SubscriptionDoc = HydratedDocument<InferSchemaType<typeof subscriptionSchema>>;
export const Subscription = model('Subscription', subscriptionSchema);
