import * as React from 'react';
import { io, type Socket } from 'socket.io-client';
import { Loader2, Send, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getSocketOrigin, sendWidgetMessage, startWidgetChat, type WidgetSession } from '@/features/chat-widget/api';

interface WidgetMessage {
  id: string;
  sender: 'customer' | 'ai' | 'system';
  body: string;
  streaming?: boolean;
}

export function WidgetChatPanel({ workspaceSlug }: { workspaceSlug: string }) {
  const [session, setSession] = React.useState<WidgetSession | null>(null);
  const [messages, setMessages] = React.useState<WidgetMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [needsHuman, setNeedsHuman] = React.useState(false);
  const socketRef = React.useRef<Socket | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function connect() {
      const newSession = await startWidgetChat(workspaceSlug);
      if (cancelled) return;
      setSession(newSession);

      const socket = io(getSocketOrigin(), {
        path: '/socket.io',
        auth: { token: newSession.token },
      });
      socketRef.current = socket;

      socket.on('ai:delta', ({ delta }: { delta: string }) => {
        setMessages((prev) => {
          const last = prev.at(-1);
          if (last?.sender === 'ai' && last.streaming) {
            return [...prev.slice(0, -1), { ...last, body: last.body + delta }];
          }
          return [...prev, { id: crypto.randomUUID(), sender: 'ai', body: delta, streaming: true }];
        });
      });

      socket.on('ai:done', ({ needsHuman: flag }: { needsHuman: boolean }) => {
        setMessages((prev) => {
          const last = prev.at(-1);
          if (last?.sender === 'ai') return [...prev.slice(0, -1), { ...last, streaming: false }];
          return prev;
        });
        setNeedsHuman(flag);
      });

      socket.on('ai:error', ({ message }: { message: string }) => {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: 'system', body: message }]);
      });
    }

    void connect();
    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
    };
  }, [workspaceSlug]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !session || isSending) return;

    setInput('');
    setNeedsHuman(false);
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: 'customer', body: text }]);
    setIsSending(true);
    try {
      await sendWidgetMessage(workspaceSlug, session.conversationId, session.token, text);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test your AI</CardTitle>
        <CardDescription>
          Chat with your AI exactly as a customer would — it only answers from your knowledge base.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="flex h-80 flex-col gap-3 overflow-y-auto rounded-md border border-border bg-secondary/20 p-4"
        >
          {messages.length === 0 && (
            <p className="m-auto text-sm text-muted-foreground">Say hello to try it out.</p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                message.sender === 'customer' && 'ml-auto bg-primary text-primary-foreground',
                message.sender === 'ai' && 'bg-card border border-border',
                message.sender === 'system' && 'mx-auto bg-destructive/10 text-destructive text-xs',
              )}
            >
              {message.body}
              {message.streaming && <span className="ml-1 inline-block animate-pulse">▍</span>}
            </div>
          ))}
        </div>

        {needsHuman && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-warning/15 px-3 py-2 text-xs text-warning">
            <UserCog className="h-3.5 w-3.5" />
            This conversation has been handed off to a human agent — check the Inbox to reply.
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <Input
            placeholder={session ? 'Ask a question...' : 'Connecting...'}
            disabled={!session}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleSend();
            }}
          />
          <Button onClick={() => void handleSend()} disabled={!session || isSending || !input.trim()}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
