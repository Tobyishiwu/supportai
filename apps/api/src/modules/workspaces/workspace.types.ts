import type { PermissionKey } from '../../models/permission.model.js';
import type { SystemRoleName } from '../../models/role.model.js';

export const SYSTEM_ROLE_PERMISSIONS: Record<SystemRoleName, PermissionKey[]> = {
  owner: [
    'workspace:manage',
    'settings:manage',
    'team:manage',
    'conversations:view',
    'conversations:reply',
    'knowledge:manage',
    'tickets:manage',
    'analytics:view',
  ],
  agent: ['conversations:view', 'conversations:reply', 'tickets:manage', 'analytics:view'],
};

export interface CreateWorkspaceInput {
  name: string;
  industry?: string;
}

export interface InviteMemberInput {
  email: string;
  roleName: SystemRoleName | string;
}
