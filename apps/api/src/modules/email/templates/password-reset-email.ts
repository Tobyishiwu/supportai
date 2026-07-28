import { emailButton, emailLayout, type EmailContent } from './layout.js';

export interface PasswordResetEmailParams {
  name: string;
  resetUrl: string;
}

export function renderPasswordResetEmail(params: PasswordResetEmailParams): EmailContent {
  const { name, resetUrl } = params;
  return {
    subject: 'Reset your SupportAI password',
    html: emailLayout(`
      <h1 style="font-size: 18px; font-weight: 600; margin: 0 0 16px;">Reset your password</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 24px;">
        Hi ${name}, we received a request to reset your SupportAI password. This link expires in 30 minutes.
      </p>
      ${emailButton('Reset password', resetUrl)}
      <p style="font-size: 12px; line-height: 1.6; color: #a1a1aa; margin: 24px 0 0;">
        If you didn't request this, you can safely ignore this email — your password won't change.
      </p>
    `),
  };
}
