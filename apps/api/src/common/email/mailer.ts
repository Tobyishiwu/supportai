import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  client ??= new Resend(env.RESEND_API_KEY);
  return client;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/** Degrades to a logged no-op when RESEND_API_KEY isn't configured, same as the AI providers do without a key. */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const resend = getClient();
  if (!resend) {
    logger.warn(
      { to: input.to, subject: input.subject },
      'RESEND_API_KEY not configured — email not sent',
    );
    return;
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
