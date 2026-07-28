import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface WidgetTokenPayload {
  workspaceId: string;
  customerId: string;
  conversationId: string;
}

const WIDGET_TOKEN_TTL = '2h';

export function signWidgetToken(payload: WidgetTokenPayload): string {
  const options: SignOptions = { expiresIn: WIDGET_TOKEN_TTL };
  return jwt.sign(payload, env.WIDGET_TOKEN_SECRET, options);
}

export function verifyWidgetToken(token: string): WidgetTokenPayload {
  return jwt.verify(token, env.WIDGET_TOKEN_SECRET) as WidgetTokenPayload;
}
