import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace } from '@/features/workspace/workspace-provider';
import { fetchTickets, updateTicket } from '@/features/tickets/api';
import type { TicketStatus } from '@/features/tickets/types';
import { getApiErrorMessage } from '@/lib/api-error';
import { CreateTicketDialog } from './create-ticket-dialog';

const PRIORITY_VARIANT = {
  low: 'secondary',
  medium: 'outline',
  high: 'warning',
  urgent: 'destructive',
} as const;

export function TicketsPage() {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', workspace?.id],
    queryFn: () => fetchTickets(workspace!.id),
    enabled: Boolean(workspace),
  });

  const updateMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) =>
      updateTicket(workspace!.id, ticketId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets', workspace?.id] }),
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not update ticket')),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track escalated issues independently of the chat they came from.
          </p>
        </div>
        {workspace && <CreateTicketDialog workspaceId={workspace.id} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {tickets?.length ?? 0} ticket{tickets?.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-9 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && tickets?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No tickets yet. Create one from a conversation or the button above.
                  </TableCell>
                </TableRow>
              )}

              {tickets?.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {ticket.customer.name ?? ticket.customer.email ?? 'Anonymous'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={PRIORITY_VARIANT[ticket.priority]} className="capitalize">
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.status}
                      onValueChange={(v) => updateMutation.mutate({ ticketId: ticket.id, status: v as TicketStatus })}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['open', 'in_progress', 'resolved', 'closed'] as const).map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
