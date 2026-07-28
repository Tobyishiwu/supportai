import type { Response } from 'express';
import { env, isProduction } from '../../config/env.js';
import { parseDurationToSeconds } from '../utils/duration.js';

export const REFRESH_COOKIE_NAME = 'supportai_refresh';

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    domain: env.COOKIE_DOMAIN,
    path: '/api/v1/auth',
    maxAge: parseDurationToSeconds(env.JWT_REFRESH_TTL) * 1000,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    domain: env.COOKIE_DOMAIN,
    path: '/api/v1/auth',
  });
}
