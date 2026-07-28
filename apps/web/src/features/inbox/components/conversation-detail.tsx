import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bot, Loader2, Notebook, Send, UserCog } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { fetchConversation, forceHandoff, sendAgentMessage, updateConversation } from '@/features/inbox/api';
import type { ConversationStatus } from '@/features/inbox/types';
import { fetchMembers } from '@/features/workspace/api';
import { fetchTags, createTag } from '@/features/tags/api';
import { getApiErrorMessage } from '@/lib/api-error';

export function ConversationDetail({ workspaceId, conversationId }: { workspaceId: string; conversationId: string }) {
  const queryClient = useQueryClient();
  const [reply, setReply] = React.useState('');
  const [isNote, setIsNote] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inbox', workspaceId, 'conversation', conversationId],
    queryFn: () => fetchConversation(workspaceId, conversationId),
    refetchInterval: 5000,
  });

  const { data: members } = useQuery({
    queryKey: ['workspace', workspaceId, 'members'],
    queryFn: () => fetchMembers(workspaceId),
  });

  const { data: tags } = useQuery({
    queryKey: ['workspace', workspaceId, 'tags'],
    queryFn: () => fetchTags(workspaceId),
  });

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [data?.messages.length]);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['inbox', workspaceId] });
  }

  const sendMutation = useMutation({
    mutationFn: () => sendAgentMessage(workspaceId, conversationId, { body: reply, isInternalNote: isNote }),
    onSuccess: () => {
      setReply('');
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not send message')),
  });

  const updateMutation = useMutation({
    mutationFn: (updates: { assignedTo?: string | null; status?: ConversationStatus; tags?: string[] }) =>
      updateConversation(workspaceId, conversationId, updates),
    onSuccess: () => {
      invalidate();
      toast.success('Conversation updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not update conversation')),
  });

  const handoffMutation = useMutation({
    mutationFn: () => forceHandoff(workspaceId, conversationId),
    onSuccess: () => {
      invalidate();
      toast.success('Handed off to your team');
    },
  });

  const createTagMutation = useMutation({
    mutationFn: (name: string) => createTag(workspaceId, { name }),
    onSuccess: (tag) => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'tags'] });
      const current = data?.conversation.tags.map((t) => t.id) ?? [];
      updateMutation.mutate({ tags: [...current, tag.id] });
    },
  });

  if (isLoading || !data) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  const { conversation, messages } = data;
  const customerName = conversation.customer.name ?? conversation.customer.email ?? 'Anonymous visitor';
  const activeTagIds = new Set(conversation.tags.map((t) => t.id));

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div>
          <p className="font-medium">{customerName}</p>
          <p className="text-xs text-muted-foreground">{conversation.customer.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={conversation.assignedTo?.id ?? 'unassigned'}
            onValueChange={(v) => updateMutation.mutate({ assignedTo: v === 'unassigned' ? null : v })}
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members?.map((m) => (
                <SelectItem key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={conversation.status}
            onValueChange={(v) => updateMutation.mutate({ status: v as ConversationStatus })}
          >
            <SelectTrigger className="h-8 w-32 text-xs capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['open', 'pending', 'resolved', 'closed'] as const).map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {conversation.aiHandled && (
            <Button size="sm" variant="outline" onClick={() => handoffMutation.mutate()}>
              <UserCog className="h-3.5 w-3.5" />
              Take over
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-5 py-2">
        {tags?.map((tag) => {
          const active = activeTagIds.has(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                const next = active
                  ? conversation.tags.filter((t) => t.id !== tag.id).map((t) => t.id)
                  : [...conversation.tags.map((t) => t.id), tag.id];
                updateMutation.mutate({ tags: next });
              }}
            >
              <Badge variant={active ? 'default' : 'outline'}>{tag.name}</Badge>
            </button>
          );
        })}
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            const name = window.prompt('New tag name');
            if (name?.trim()) createTagMutation.mutate(name.trim());
          }}
        >
          + New tag
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.sender === 'agent' && !message.isInternalNote && 'justify-end',
            )}
          >
            {message.isInternalNote ? (
              <div className="mx-auto flex max-w-[85%] items-start gap-2 rounded-md bg-warning/15 px-3 py-2 text-sm text-warning-foreground">
                <Notebook className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                <div>
                  <p className="text-xs font-medium text-warning">
                    Internal note {message.author ? `· ${message.author.name}` : ''}
                  </p>
                  <p className="text-foreground">{message.body}</p>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                  message.sender === 'customer' && 'bg-secondary',
                  message.sender === 'ai' && 'border border-border bg-card',
                  message.sender === 'agent' && 'bg-primary text-primary-foreground',
                )}
              >
                {message.sender === 'ai' && (
                  <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Bot className="h-3 w-3" /> AI
                    {message.aiMeta.confidence !== null && ` · ${Math.round(message.aiMeta.confidence * 100)}% confidence`}
                  </p>
                )}
                {message.sender === 'agent' && message.author && (
                  <p className="mb-1 text-[11px] font-medium opacity-80">{message.author.name}</p>
                )}
                {message.body}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-border p-4">
        <div className="mb-2 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={isNote ? 'default' : 'outline'}
            onClick={() => setIsNote((v) => !v)}
          >
            <Notebook className="h-3.5 w-3.5" />
            {isNote ? 'Internal note' : 'Reply to customer'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Textarea
            rows={2}
            placeholder={isNote ? 'Leave a note for your team...' : 'Reply to the customer...'}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (reply.trim()) sendMutation.mutate();
              }
            }}
          />
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={!reply.trim() || sendMutation.isPending}
            className="self-end"
          >
            {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
