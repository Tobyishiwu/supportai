import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

/** Static, platform-defined capabilities. Seeded once at boot — see modules/workspaces/permissions.seed.ts */
export const PERMISSION_KEYS = [
  'workspace:manage',
  'settings:manage',
  'team:manage',
  'conversations:view',
  'conversations:reply',
  'knowledge:manage',
  'tickets:manage',
  'analytics:view',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

const permissionSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, enum: PERMISSION_KEYS },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

permissionSchema.plugin(toJSONPlugin);

export type PermissionDoc = HydratedDocument<InferSchemaType<typeof permissionSchema>>;
export const Permission = model('Permission', permissionSchema);
