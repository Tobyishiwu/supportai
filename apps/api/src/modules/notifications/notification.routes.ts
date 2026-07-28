import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { resolveWorkspace } from '../../common/middleware/resolve-workspace.js';
import { validate } from '../../common/middleware/validate.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import * as controller from './notification.controller.js';
import { listNotificationsQuerySchema, notificationIdParamSchema } from './notification.validation.js';
import { workspaceIdParamSchema } from '../workspaces/workspace.validation.js';

export const notificationRouter = Router({ mergeParams: true });

notificationRouter.use(authenticate, validate({ params: workspaceIdParamSchema }), resolveWorkspace);

notificationRouter.get('/', validate({ query: listNotificationsQuerySchema }), asyncHandler(controller.list));
notificationRouter.get('/unread-count', asyncHandler(controller.unreadCount));
notificationRouter.patch('/read-all', asyncHandler(controller.markAllRead));
notificationRouter.patch(
  '/:notificationId/read',
  validate({ params: notificationIdParamSchema }),
  asyncHandler(controller.markRead),
);
