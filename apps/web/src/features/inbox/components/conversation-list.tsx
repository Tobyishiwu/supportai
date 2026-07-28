import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { fetchConversations } from '@/features/inbox/api';
import type { Conversation, ConversationStatus } from '@/features/inbox/types';

const STATUS_TABS: { value: ConversationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface ConversationListProps {
  workspaceId: string;
  status: ConversationStatus | 'all';
  onStatusChange: (status: ConversationStatus | 'all') => void;
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({ workspaceId, status, onStatusChange, selectedId, onSelect }: ConversationListProps) {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['inbox', workspaceId, 'conversations', status],
    queryFn: () => fetchConversations(workspaceId, { status: status === 'all' ? undefined : status }),
    refetchInterval: 15_000,
  });

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r border-border">
      <div className="border-b border-border p-3">
        <Tabs value={status} onValueChange={(v) => onStatusChange(v as ConversationStatus | 'all')}>
          <TabsList className="w-full">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3">
              <Skeleton className="h-14 w-full" />
            </div>
          ))}

        {!isLoading && conversations?.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">No conversations here.</p>
        )}

        {conversations?.map((conversation) => {
          const name = conversation.customer.name ?? conversation.customer.email ?? 'Anonymous visitor';
          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelect(conversation)}
              className={cn(
                'flex w-full items-start gap-3 border-b border-border/60 px-3 py-3 text-left transition-colors hover:bg-accent/40',
                selectedId === conversation.id && 'bg-accent/60',
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>{initials(name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {timeAgo(conversation.lastMessageAt)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant={
                      conversation.status === 'open'
                        ? 'success'
                        : conversation.status === 'pending'
                          ? 'warning'
                          : 'secondary'
                    }
                    className="capitalize"
                  >
                    {conversation.status}
                  </Badge>
                  {!conversation.aiHandled && (
                    <Badge variant="outline">{conversation.assignedTo ? conversation.assignedTo.name : 'Unassigned'}</Badge>
                  )}
                  {conversation.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
