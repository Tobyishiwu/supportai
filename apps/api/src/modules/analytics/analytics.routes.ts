import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { resolveWorkspace } from '../../common/middleware/resolve-workspace.js';
import { requirePermission } from '../../common/middleware/require-permission.js';
import { validate } from '../../common/middleware/validate.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import * as controller from './analytics.controller.js';
import { overviewQuerySchema, workspaceIdParamSchema } from './analytics.validation.js';

export const analyticsRouter = Router({ mergeParams: true });

analyticsRouter.use(
  authenticate,
  validate({ params: workspaceIdParamSchema }),
  resolveWorkspace,
  requirePermission('analytics:view'),
);

analyticsRouter.get('/overview', validate({ query: overviewQuerySchema }), asyncHandler(controller.overview));
analyticsRouter.post('/rollup', asyncHandler(controller.triggerRollup));
