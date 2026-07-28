import type { Schema } from 'mongoose';

/**
 * Normalizes every model's JSON representation: `_id` -> `id`, drop `__v`,
 * so API responses never leak Mongoose internals to the client.
 */
export function toJSONPlugin(schema: Schema): void {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
}
