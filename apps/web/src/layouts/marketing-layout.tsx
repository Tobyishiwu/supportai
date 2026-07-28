import type { ReactNode } from 'react';

export function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-svh bg-background text-foreground">{children}</div>;
}
