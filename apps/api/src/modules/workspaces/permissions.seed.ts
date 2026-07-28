import { Permission, PERMISSION_KEYS } from '../../models/permission.model.js';
import { logger } from '../../config/logger.js';

const DESCRIPTIONS: Record<(typeof PERMISSION_KEYS)[number], string> = {
  'workspace:manage': 'Manage workspace profile and delete the workspace',
  'settings:manage': 'Manage workspace and AI settings',
  'team:manage': 'Invite, remove, and change roles of teammates',
  'conversations:view': 'View customer conversations',
  'conversations:reply': 'Reply to and manage customer conversations',
  'knowledge:manage': 'Upload and manage knowledge base content',
  'tickets:manage': 'Create and manage support tickets',
  'analytics:view': 'View support analytics and insights',
};

/** Idempotently ensures every platform permission exists. Runs once at boot. */
export async function seedPermissions(): Promise<void> {
  const ops = PERMISSION_KEYS.map((key) => ({
    updateOne: {
      filter: { key },
      update: { $setOnInsert: { key, description: DESCRIPTIONS[key] } },
      upsert: true,
    },
  }));
  await Permission.bulkWrite(ops);
  logger.info({ count: PERMISSION_KEYS.length }, 'Permissions seeded');
}
