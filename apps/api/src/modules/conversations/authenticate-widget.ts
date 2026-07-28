import type { NextFunction, Request, Response } from 'express';
import { verifyWidgetToken } from '../../common/auth/widget-jwt.js';
import { AppError } from '../../common/errors/app-error.js';

export function authenticateWidget(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    next(AppError.unauthorized());
    return;
  }

  try {
    const payload = verifyWidgetToken(header.slice('Bearer '.length));

    if (payload.workspaceId !== req.publicWorkspace?.id || payload.conversationId !== req.params.conversationId) {
      next(AppError.forbidden('Widget token does not match this conversation'));
      return;
    }

    req.widgetAuth = payload;
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired widget session'));
  }
}
