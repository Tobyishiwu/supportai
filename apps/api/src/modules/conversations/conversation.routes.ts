import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { resolveWorkspace } from '../../common/middleware/resolve-workspace.js';
import { requirePermission } from '../../common/middleware/require-permission.js';
import { validate } from '../../common/middleware/validate.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import * as controller from './conversation.controller.js';
import {
  conversationIdParamSchema,
  createMessageSchema,
  listConversationsQuerySchema,
  updateConversationSchema,
  workspaceIdParamSchema,
} from './conversation.validation.js';

export const conversationRouter = Router({ mergeParams: true });

conversationRouter.use(authenticate, validate({ params: workspaceIdParamSchema }), resolveWorkspace);

conversationRouter.get(
  '/',
  requirePermission('conversations:view'),
  validate({ query: listConversationsQuerySchema }),
  asyncHandler(controller.list),
);

conversationRouter.get(
  '/:conversationId',
  requirePermission('conversations:view'),
  validate({ params: conversationIdParamSchema }),
  asyncHandler(controller.get),
);

conversationRouter.patch(
  '/:conversationId',
  requirePermission('conversations:reply'),
  validate({ params: conversationIdParamSchema, body: updateConversationSchema }),
  asyncHandler(controller.update),
);

conversationRouter.post(
  '/:conversationId/messages',
  requirePermission('conversations:reply'),
  validate({ params: conversationIdParamSchema, body: createMessageSchema }),
  asyncHandler(controller.createMessage),
);

conversationRouter.post(
  '/:conversationId/handoff',
  requirePermission('conversations:reply'),
  validate({ params: conversationIdParamSchema }),
  asyncHandler(controller.handoff),
);
