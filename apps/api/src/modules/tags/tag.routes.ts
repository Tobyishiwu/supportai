import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { resolveWorkspace } from '../../common/middleware/resolve-workspace.js';
import { requirePermission } from '../../common/middleware/require-permission.js';
import { validate } from '../../common/middleware/validate.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import * as controller from './tag.controller.js';
import { createTagSchema, workspaceIdParamSchema } from './tag.validation.js';

export const tagRouter = Router({ mergeParams: true });

tagRouter.use(authenticate, validate({ params: workspaceIdParamSchema }), resolveWorkspace);

tagRouter.get('/', requirePermission('conversations:view'), asyncHandler(controller.list));
tagRouter.post(
  '/',
  requirePermission('conversations:reply'),
  validate({ body: createTagSchema }),
  asyncHandler(controller.create),
);
