import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate.js';
import { resolveWorkspace } from '../../../common/middleware/resolve-workspace.js';
import { requirePermission } from '../../../common/middleware/require-permission.js';
import { validate } from '../../../common/middleware/validate.js';
import { asyncHandler } from '../../../common/utils/async-handler.js';
import * as controller from './ai-settings.controller.js';
import { updateAISettingSchema, workspaceIdParamSchema } from './ai-settings.validation.js';

export const aiSettingsRouter = Router({ mergeParams: true });

aiSettingsRouter.use(authenticate, validate({ params: workspaceIdParamSchema }), resolveWorkspace);

aiSettingsRouter.get('/', asyncHandler(controller.getSettings));
aiSettingsRouter.patch(
  '/',
  requirePermission('settings:manage'),
  validate({ body: updateAISettingSchema }),
  asyncHandler(controller.updateSettings),
);
