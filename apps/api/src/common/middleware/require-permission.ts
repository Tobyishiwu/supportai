import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import type { PermissionKey } from '../../models/permission.model.js';

export function requirePermission(permission: PermissionKey) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.member?.permissions.includes(permission)) {
      next(AppError.forbidden(`Missing required permission: ${permission}`));
      return;
    }
    next();
  };
}
