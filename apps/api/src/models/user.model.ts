import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    status: { type: String, enum: ['active', 'suspended'] as const, default: 'active' },
  },
  { timestamps: true },
);

userSchema.plugin(toJSONPlugin);

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;
export const User = model('User', userSchema);
