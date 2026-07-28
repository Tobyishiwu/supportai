import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface AccessTokenPayload {
  sub: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_TTL as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_TTL as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
