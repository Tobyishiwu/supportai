import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { BarChart3, Inbox, Sparkles, Ticket, UserSquare2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspace } from '@/features/workspace/workspace-provider';
import { fetchMembers } from '@/features/workspace/api';

const QUICK_LINKS = [
  { to: '/dashboard/inbox', icon: Inbox, title: 'Live Chat Inbox', phase: 'Phase 5' },
  { to: '/dashboard/ai-settings', icon: Sparkles, title: 'AI Settings', phase: 'Phase 4' },
  { to: '/dashboard/analytics', icon: BarChart3, title: 'Analytics', phase: 'Phase 6' },
  { to: '/dashboard/customers', icon: UserSquare2, title: 'Customers', phase: 'Phase 5' },
  { to: '/dashboard/tickets', icon: Ticket, title: 'Tickets', phase: 'Phase 5' },
] as const;

export function OverviewPage() {
  const { workspace, isLoading: workspaceLoading } = useWorkspace();

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['workspace', workspace?.id, 'members'],
    queryFn: () => fetchMembers(workspace!.id),
    enabled: Boolean(workspace),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back{workspace ? `, ${workspace.name}` : ''}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your support workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Team members</CardDescription>
            {membersLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <CardTitle className="text-3xl">{members?.length ?? 0}</CardTitle>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Industry</CardDescription>
            {workspaceLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <CardTitle className="text-lg capitalize">{workspace?.industry ?? 'Not set'}</CardTitle>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Workspace URL</CardDescription>
            {workspaceLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <CardTitle className="text-lg">/{workspace?.slug}</CardTitle>
            )}
          </CardHeader>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Build out your workspace</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map(({ to, icon: Icon, title, phase }) => (
            <Link key={to} to={to}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="flex items-start gap-3 py-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <Badge variant="secondary" className="mt-1.5">
                      {phase}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
