import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate.js';
import { resolveWorkspace } from '../../../common/middleware/resolve-workspace.js';
import { requirePermission } from '../../../common/middleware/require-permission.js';
import { validate } from '../../../common/middleware/validate.js';
import { asyncHandler } from '../../../common/utils/async-handler.js';
import * as controller from './copilot.controller.js';
import { copilotParamsSchema } from './copilot.validation.js';

export const copilotRouter = Router({ mergeParams: true });

copilotRouter.use(
  authenticate,
  validate({ params: copilotParamsSchema }),
  resolveWorkspace,
  requirePermission('conversations:reply'),
);

copilotRouter.post('/analyze', asyncHandler(controller.analyze));
copilotRouter.post('/suggest-reply', asyncHandler(controller.suggestReply));
