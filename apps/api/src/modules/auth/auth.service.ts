import { User, type UserDoc } from '../../models/user.model.js';
import { AppError } from '../../common/errors/app-error.js';
import { hashPassword, comparePassword } from '../../common/auth/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../common/auth/jwt.js';
import {
  createRefreshSession,
  isRefreshSessionValid,
  revokeAllRefreshSessions,
  revokeRefreshSession,
  rotateRefreshSession,
} from '../../common/auth/refresh-session.store.js';
import {
  consumePasswordResetToken,
  createPasswordResetToken,
} from '../../common/auth/password-reset.store.js';
import { env } from '../../config/env.js';
import { enqueueEmail } from '../email/email.queue.js';
import { renderPasswordResetEmail } from '../email/templates/password-reset-email.js';
import { createWorkspaceForOwner } from '../workspaces/workspace.service.js';
import type { AuthTokens, LoginInput, RegisterInput } from './auth.types.js';

async function issueTokens(userId: string): Promise<AuthTokens> {
  const jti = await createRefreshSession(userId);
  return {
    accessToken: signAccessToken({ sub: userId }),
    refreshToken: signRefreshToken({ sub: userId, jti }),
  };
}

export async function register(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw AppError.conflict('An account with this email already exists');

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({ name: input.name, email: input.email, passwordHash });

  const { workspace, membership } = await createWorkspaceForOwner(String(user._id), {
    name: input.workspaceName,
    industry: input.industry,
  });

  const tokens = await issueTokens(String(user._id));
  return { user, workspace, membership, tokens };
}

export async function login(input: LoginInput): Promise<{ user: UserDoc; tokens: AuthTokens }> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) throw AppError.unauthorized('Invalid email or password');
  if (user.status === 'suspended') throw AppError.forbidden('This account has been suspended');

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) throw AppError.unauthorized('Invalid email or password');

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueTokens(String(user._id));
  return { user, tokens };
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired session. Please log in again.');
  }

  const valid = await isRefreshSessionValid(payload.sub, payload.jti);
  if (!valid) throw AppError.unauthorized('Session has been revoked. Please log in again.');

  const newJti = await rotateRefreshSession(payload.sub, payload.jti);
  return {
    accessToken: signAccessToken({ sub: payload.sub }),
    refreshToken: signRefreshToken({ sub: payload.sub, jti: newJti }),
  };
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    await revokeRefreshSession(payload.sub, payload.jti);
  } catch {
    // Token already invalid/expired — nothing to revoke.
  }
}

export async function getCurrentUser(userId: string): Promise<UserDoc> {
  const user = await User.findById(userId);
  if (!user) throw AppError.unauthorized();
  return user;
}

/** No-ops silently for an unknown email — the caller always returns a generic response, to avoid leaking which emails have accounts. */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await User.findOne({ email });
  if (!user) return;

  const token = await createPasswordResetToken(String(user._id));
  const resetUrl = `${env.WEB_APP_URL}/reset-password?token=${token}`;
  const { subject, html } = renderPasswordResetEmail({ name: user.name, resetUrl });
  await enqueueEmail({ to: user.email, subject, html });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const userId = await consumePasswordResetToken(token);
  if (!userId) throw AppError.unauthorized('This password reset link is invalid or has expired');

  const user = await User.findById(userId);
  if (!user) throw AppError.unauthorized('This password reset link is invalid or has expired');

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  await revokeAllRefreshSessions(userId);
}
