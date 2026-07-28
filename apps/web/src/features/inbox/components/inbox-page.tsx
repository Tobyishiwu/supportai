import * as React from 'react';
import { MessagesSquare } from 'lucide-react';
import { useWorkspace } from '@/features/workspace/workspace-provider';
import { useInboxSocket } from '@/features/inbox/use-inbox-socket';
import type { Conversation, ConversationStatus } from '@/features/inbox/types';
import { ConversationList } from './conversation-list';
import { ConversationDetail } from './conversation-detail';

export function InboxPage() {
  const { workspace } = useWorkspace();
  const [status, setStatus] = React.useState<ConversationStatus | 'all'>('all');
  const [selected, setSelected] = React.useState<Conversation | null>(null);

  useInboxSocket(workspace?.id);

  if (!workspace) return null;

  return (
    <div className="-m-8 flex h-[calc(100vh-3.5rem)]">
      <ConversationList
        workspaceId={workspace.id}
        status={status}
        onStatusChange={setStatus}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
      />
      {selected ? (
        <ConversationDetail workspaceId={workspace.id} conversationId={selected.id} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
          <MessagesSquare className="h-8 w-8" />
          <p className="text-sm">Select a conversation to get started</p>
        </div>
      )}
    </div>
  );
}
