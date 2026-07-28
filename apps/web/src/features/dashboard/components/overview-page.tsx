import { useQuery } from '@tanstack/react-query';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspace } from '@/features/workspace/workspace-provider';
import { fetchMembers } from '@/features/workspace/api';

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
    </div>
  );
}
