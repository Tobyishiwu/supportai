import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { acceptInvite, fetchMyInvites } from '@/features/workspace/api';
import { getApiErrorMessage } from '@/lib/api-error';

export function InvitesPage() {
  const queryClient = useQueryClient();

  const { data: invites, isLoading } = useQuery({
    queryKey: ['invites', 'mine'],
    queryFn: fetchMyInvites,
  });

  const acceptMutation = useMutation({
    mutationFn: (workspaceId: string) => acceptInvite(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', 'mine'] });
      toast.success('Invite accepted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not accept invite')),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invites</h1>
        <p className="mt-1 text-sm text-muted-foreground">Workspaces you've been invited to join.</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!isLoading && invites?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Mail className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No pending invites</p>
            <p className="text-sm text-muted-foreground">
              When a workspace invites you, it will show up here.
            </p>
          </CardContent>
        </Card>
      )}

      {invites?.map((invite) => (
        <Card key={invite.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-medium">{invite.workspace.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {invite.invitedBy ? `Invited by ${invite.invitedBy.name} · ` : ''}
                <Badge variant="outline" className="ml-0 capitalize">
                  {invite.role.name}
                </Badge>
              </p>
            </div>
            <Button
              onClick={() => acceptMutation.mutate(invite.workspace.id)}
              disabled={acceptMutation.isPending}
            >
              Accept
            </Button>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
