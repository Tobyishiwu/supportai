import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BookOpen, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { analyzeConversation, suggestReply, type ConversationAnalysis, type SuggestedReply } from '@/features/copilot/api';
import { getApiErrorMessage } from '@/lib/api-error';

const SENTIMENT_VARIANT = {
  positive: 'success',
  neutral: 'secondary',
  negative: 'destructive',
} as const;

interface CopilotPanelProps {
  workspaceId: string;
  conversationId: string;
  onUseSuggestion: (text: string) => void;
}

/**
 * Mount with `key={conversationId}` from the parent so switching conversations
 * remounts this panel (resetting analysis/reply state) instead of reusing it.
 */
export function CopilotPanel({ workspaceId, conversationId, onUseSuggestion }: CopilotPanelProps) {
  const [analysis, setAnalysis] = React.useState<ConversationAnalysis | null>(null);
  const [reply, setReply] = React.useState<SuggestedReply | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeConversation(workspaceId, conversationId),
    onSuccess: setAnalysis,
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not analyze conversation')),
  });

  const suggestMutation = useMutation({
    mutationFn: () => suggestReply(workspaceId, conversationId),
    onSuccess: setReply,
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not generate a suggestion')),
  });

  return (
    <div className="w-80 shrink-0 space-y-4 overflow-y-auto border-l border-border p-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <Sparkles className="h-4 w-4" />
            Copilot summary
          </CardTitle>
          <CardDescription>Sentiment, category, and a quick recap.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={SENTIMENT_VARIANT[analysis.sentiment]} className="capitalize">
                  {analysis.sentiment}
                </Badge>
                <Badge variant="outline">{analysis.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No summary yet.</p>
          )}
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
          >
            {analyzeMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {analysis ? 'Re-analyze' : 'Analyze conversation'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <Wand2 className="h-4 w-4" />
            Suggested reply
          </CardTitle>
          <CardDescription>Grounded in your knowledge base — review before sending.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reply && (
            <>
              <p className="rounded-md bg-secondary/50 p-2.5 text-sm">{reply.suggestion}</p>
              {reply.usedArticles.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Sources</p>
                  <div className="flex flex-wrap gap-1.5">
                    {reply.usedArticles.map((article) => (
                      <Badge key={article.id} variant="outline" className="gap-1">
                        <BookOpen className="h-3 w-3" />
                        {article.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Button size="sm" className="w-full" onClick={() => onUseSuggestion(reply.suggestion)}>
                Use this reply
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => suggestMutation.mutate()}
            disabled={suggestMutation.isPending}
          >
            {suggestMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            {reply ? 'Regenerate' : 'Suggest a reply'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
