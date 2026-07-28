import type { NextFunction, Request, Response } from 'express';
import { Workspace } from '../../models/workspace.model.js';
import { AppError } from '../../common/errors/app-error.js';
import { asyncHandler } from '../../common/utils/async-handler.js';

async function resolvePublicWorkspaceHandler(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const { workspaceSlug } = req.params;
  const workspace = await Workspace.findOne({ slug: workspaceSlug });
  if (!workspace) {
    next(AppError.notFound('Workspace not found'));
    return;
  }
  req.publicWorkspace = { id: String(workspace._id), slug: workspace.slug };
  next();
}

export const resolvePublicWorkspace = asyncHandler(resolvePublicWorkspaceHandler);
