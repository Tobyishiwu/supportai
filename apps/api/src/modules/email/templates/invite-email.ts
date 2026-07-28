import { emailButton, emailLayout, type EmailContent } from './layout.js';

export interface InviteEmailParams {
  workspaceName: string;
  inviterName: string;
  roleName: string;
  acceptUrl: string;
}

export function renderInviteEmail(params: InviteEmailParams): EmailContent {
  const { workspaceName, inviterName, roleName, acceptUrl } = params;
  return {
    subject: `${inviterName} invited you to join ${workspaceName} on SupportAI`,
    html: emailLayout(`
      <h1 style="font-size: 18px; font-weight: 600; margin: 0 0 16px;">You've been invited to ${workspaceName}</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 24px;">
        ${inviterName} invited you to join <strong>${workspaceName}</strong> on SupportAI as
        ${roleName === 'owner' ? 'an' : 'a'} <strong>${roleName}</strong>.
      </p>
      ${emailButton('Accept invitation', acceptUrl)}
      <p style="font-size: 12px; line-height: 1.6; color: #a1a1aa; margin: 24px 0 0;">
        If you weren't expecting this invite, you can safely ignore this email.
      </p>
    `),
  };
}
