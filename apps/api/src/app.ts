import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestId } from './common/middleware/request-id.js';
import { httpLogger } from './common/middleware/http-logger.js';
import { globalRateLimiter } from './common/middleware/rate-limit.js';
import { errorHandler, notFoundHandler } from './common/middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { workspaceRouter } from './modules/workspaces/workspace.routes.js';
import { notificationRouter } from './modules/notifications/notification.routes.js';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(requestId);
  app.use(httpLogger);
  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_APP_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(globalRateLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/workspaces', workspaceRouter);
  app.use('/api/v1/workspaces/:workspaceId/notifications', notificationRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
