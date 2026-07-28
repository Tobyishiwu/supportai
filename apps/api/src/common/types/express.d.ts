import type { PermissionKey } from '../../models/permission.model.js';

declare global {
  namespace Express {
    interface Request {
      id: string;
      auth?: {
        userId: string;
      };
      workspaceId?: string;
      member?: {
        id: string;
        role: string;
        permissions: PermissionKey[];
      };
    }
  }
}

export {};
