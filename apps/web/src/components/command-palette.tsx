import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  BarChart3,
  BookOpen,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Ticket,
  Users,
  UserSquare2,
} from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useAuth } from '@/providers/auth-provider';

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

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function go(to: (typeof NAV_ITEMS)[number]['to']) {
    setOpen(false);
    void navigate({ to });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to a page or run a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((item) => (
            <CommandItem key={item.to} onSelect={() => go(item.to)}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Account">
          <CommandItem
            onSelect={() => {
              setOpen(false);
              void logout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
