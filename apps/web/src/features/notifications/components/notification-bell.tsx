import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspace } from '@/features/workspace/workspace-provider';
import { fetchNotifications, fetchUnreadCount, markAllNotificationsRead } from '@/features/notifications/api';

export function NotificationBell() {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = workspace?.id;

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', workspaceId, 'unread-count'],
    queryFn: () => fetchUnreadCount(workspaceId!),
    enabled: Boolean(workspaceId),
    refetchInterval: 30_000,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', workspaceId, 'list'],
    queryFn: () => fetchNotifications(workspaceId!),
    enabled: Boolean(workspaceId),
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead(workspaceId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', workspaceId] });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {Boolean(unreadCount) && (
            <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full p-0 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {Boolean(unreadCount) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {!notifications?.length ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <Inbox className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">You&apos;re all caught up.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className="px-2 py-2.5 text-sm hover:bg-accent/50">
                <p className={n.readAt ? 'text-muted-foreground' : 'font-medium'}>{n.type}</p>
                <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
