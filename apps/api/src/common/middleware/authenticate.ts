import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../auth/jwt.js';
import { AppError } from '../errors/app-error.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    next(AppError.unauthorized());
    return;
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub };
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired access token'));
  }
}
