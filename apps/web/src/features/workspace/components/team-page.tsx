import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/features/workspace/workspace-provider';
import { fetchMembers, removeMember } from '@/features/workspace/api';
import { InviteMemberDialog } from './invite-member-dialog';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function TeamPage() {
  const { workspace, hasPermission } = useWorkspace();
  const queryClient = useQueryClient();
  const canManageTeam = hasPermission('team:manage');

  const { data: members, isLoading } = useQuery({
    queryKey: ['workspace', workspace?.id, 'members'],
    queryFn: () => fetchMembers(workspace!.id),
    enabled: Boolean(workspace),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeMember(workspace!.id, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace', workspace?.id, 'members'] }),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage who has access to this workspace.</p>
        </div>
        {canManageTeam && workspace && <InviteMemberDialog workspaceId={workspace.id} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {members?.length ?? 0} member{members?.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {members?.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-md px-2 py-3 hover:bg-accent/40">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(member.user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={member.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                  {member.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {member.role.name}
                </Badge>
                {canManageTeam && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => removeMutation.mutate(member.id)}
                      >
                        Remove from workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
