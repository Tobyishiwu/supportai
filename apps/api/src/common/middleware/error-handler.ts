import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';
import { logger } from '../../config/logger.js';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}` },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: err.flatten() },
    });
    return;
  }

  if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
    res.status(409).json({
      error: { code: 'CONFLICT', message: 'A record with this value already exists' },
    });
    return;
  }

  logger.error({ err, requestId: req.id }, 'Unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
  });
}
