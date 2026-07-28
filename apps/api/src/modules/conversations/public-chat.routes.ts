import { Router } from 'express';
import cors from 'cors';
import { validate } from '../../common/middleware/validate.js';
import { publicChatRateLimiter } from '../../common/middleware/rate-limit.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { resolvePublicWorkspace } from './resolve-public-workspace.js';
import { authenticateWidget } from './authenticate-widget.js';
import * as controller from './public-chat.controller.js';
import {
  conversationIdParamSchema,
  sendMessageSchema,
  startChatSchema,
  workspaceSlugParamSchema,
} from './public-chat.validation.js';

export const publicChatRouter = Router({ mergeParams: true });

// The widget is embedded on arbitrary customer websites, so it needs
// permissive CORS distinct from the dashboard's WEB_APP_URL-only policy.
// It authenticates via a bearer widget token, never cookies, so credentials
// don't need to be enabled here.
publicChatRouter.use(cors({ origin: true, credentials: false }));

publicChatRouter.use(publicChatRateLimiter, validate({ params: workspaceSlugParamSchema }), resolvePublicWorkspace);

publicChatRouter.post('/start', validate({ body: startChatSchema }), asyncHandler(controller.start));

publicChatRouter.get(
  '/:conversationId/messages',
  validate({ params: conversationIdParamSchema }),
  authenticateWidget,
  asyncHandler(controller.getHistory),
);

publicChatRouter.post(
  '/:conversationId/messages',
  validate({ params: conversationIdParamSchema, body: sendMessageSchema }),
  authenticateWidget,
  asyncHandler(controller.sendMessage),
);
