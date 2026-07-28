import type { ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  BarChart3,
  BookOpen,
  Inbox,
  LayoutDashboard,
  Settings,
  Sparkles,
  Ticket,
  Users,
  UserSquare2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useWorkspace } from '@/features/workspace/workspace-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/inbox', label: 'Inbox', icon: Inbox },
  { to: '/dashboard/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { to: '/dashboard/ai-settings', label: 'AI Settings', icon: Sparkles },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/customers', label: 'Customers', icon: UserSquare2 },
  { to: '/dashboard/tickets', label: 'Tickets', icon: Ticket },
  { to: '/dashboard/team', label: 'Team', icon: Users },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { workspace } = useWorkspace();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="truncate text-sm font-semibold">{workspace?.name ?? 'SupportAI'}</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-md p-2 text-left text-sm hover:bg-accent/60">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{user ? initials(user.name) : '?'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void logout()}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end border-b border-border px-6">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
