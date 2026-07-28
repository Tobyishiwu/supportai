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
      publicWorkspace?: {
        id: string;
        slug: string;
      };
      widgetAuth?: {
        workspaceId: string;
        customerId: string;
        conversationId: string;
      };
    }
  }
}

export {};
