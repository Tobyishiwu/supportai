import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-4 text-foreground">
      <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        SupportAI
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">{children}</div>
    </div>
  );
}
