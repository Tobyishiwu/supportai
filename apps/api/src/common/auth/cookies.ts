import type { CookieOptions, Response } from 'express';
import { env, isProduction } from '../../config/env.js';
import { parseDurationToSeconds } from '../utils/duration.js';

export const REFRESH_COOKIE_NAME = 'supportai_refresh';

/**
 * The frontend (Vercel) and backend (Render) are deployed on unrelated
 * domains by default, so the refresh cookie must be sent cross-site —
 * that requires SameSite=None with Secure. Locally both run on
 * `localhost` (same site, different ports), where Lax works fine and
 * avoids requiring HTTPS in development.
 *
 * COOKIE_DOMAIN is intentionally omitted unless set: with no shared
 * parent domain between the two deployments, a host-only cookie (scoped
 * to whatever host actually issued it) is the correct default. Only set
 * COOKIE_DOMAIN if both apps are deployed under a shared custom domain
 * (e.g. `app.example.com` + `api.example.com` sharing `.example.com`).
 */
function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
    path: '/api/v1/auth',
  };
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: parseDurationToSeconds(env.JWT_REFRESH_TTL) * 1000,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions());
}
