export interface EmailContent {
  subject: string;
  html: string;
}

/** Shared inline-styled shell — email clients don't run stylesheets, so every rule stays inline. */
export function emailLayout(bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #18181b;">
      ${bodyHtml}
      <p style="font-size: 12px; color: #a1a1aa; margin: 32px 0 0;">SupportAI</p>
    </div>
  `;
}

export function emailButton(label: string, href: string): string {
  return `
    <a href="${href}" style="display: inline-block; background: #6d28d9; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 10px 20px; border-radius: 6px;">
      ${label}
    </a>
  `;
}
