import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import { getActiveMembership } from '../../modules/workspaces/workspace.service.js';
import type { PermissionKey } from '../../models/permission.model.js';
import { asyncHandler } from '../utils/async-handler.js';

/**
 * Verifies the authenticated user is an active member of `:workspaceId` and
 * attaches the resolved membership. Never trust a workspaceId for
 * authorization purposes without this check.
 */
async function resolveWorkspaceHandler(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.auth) {
    next(AppError.unauthorized());
    return;
  }

  const { workspaceId } = req.params;
  if (!workspaceId) {
    next(AppError.validation('workspaceId is required'));
    return;
  }

  const membership = await getActiveMembership(workspaceId, req.auth.userId);
  if (!membership) {
    next(AppError.forbidden('You are not a member of this workspace'));
    return;
  }

  const role = membership.role as unknown as { name: string; permissions: { key: PermissionKey }[] };

  req.workspaceId = workspaceId;
  req.member = {
    id: String(membership._id),
    role: role.name,
    permissions: role.permissions.map((p) => p.key),
  };
  next();
}

export const resolveWorkspace = asyncHandler(resolveWorkspaceHandler);
