import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } from '../../common/auth/cookies.js';
import { recordAudit } from '../../common/utils/audit.js';

export async function register(req: Request, res: Response): Promise<void> {
  const { user, workspace, membership, tokens } = await authService.register(req.body);
  setRefreshCookie(res, tokens.refreshToken);
  await recordAudit({
    req,
    action: 'auth.register',
    actor: String(user._id),
    workspace: String(workspace._id),
    targetType: 'User',
    targetId: String(user._id),
  });
  res.status(201).json({
    data: { user, workspace, membership, accessToken: tokens.accessToken },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { user, tokens } = await authService.login(req.body);
  setRefreshCookie(res, tokens.refreshToken);
  await recordAudit({ req, action: 'auth.login', actor: String(user._id), targetType: 'User', targetId: String(user._id) });
  res.json({ data: { user, accessToken: tokens.accessToken } });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!cookieToken) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No session found' } });
    return;
  }
  const tokens = await authService.refresh(cookieToken);
  setRefreshCookie(res, tokens.refreshToken);
  res.json({ data: { accessToken: tokens.accessToken } });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  await authService.logout(cookieToken);
  clearRefreshCookie(res);
  res.status(204).send();
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getCurrentUser(req.auth!.userId);
  res.json({ data: { user } });
}
