import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { fetchCustomer } from '@/features/customers/api';

export function CustomerDetailDialog({
  workspaceId,
  customerId,
  onOpenChange,
}: {
  workspaceId: string;
  customerId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['customers', workspaceId, customerId],
    queryFn: () => fetchCustomer(workspaceId, customerId!),
    enabled: Boolean(customerId),
  });

  return (
    <Dialog open={Boolean(customerId)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{data?.customer.name ?? data?.customer.email ?? 'Customer'}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p>{data?.customer.email ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p>{data?.customer.phone ?? '—'}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Conversations ({data?.conversations.length ?? 0})
              </p>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {data?.conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span>{new Date(conversation.lastMessageAt).toLocaleDateString()}</span>
                    <Badge variant="outline" className="capitalize">
                      {conversation.status}
                    </Badge>
                  </div>
                ))}
                {data?.conversations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No conversations yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
