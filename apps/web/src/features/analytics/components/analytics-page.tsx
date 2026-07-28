import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { Frown, Loader2, Meh, RefreshCw, Smile, TrendingUp, Users, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspace } from '@/features/workspace/workspace-provider';
import { fetchAnalyticsOverview, triggerAnalyticsRollup } from '@/features/analytics/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { TrendChart } from './trend-chart';

function sentimentDisplay(score: number): { label: string; Icon: typeof Smile } {
  if (score > 0.2) return { label: 'Positive', Icon: Smile };
  if (score < -0.2) return { label: 'Negative', Icon: Frown };
  return { label: 'Neutral', Icon: Meh };
}

export function AnalyticsPage() {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', workspace?.id],
    queryFn: () => fetchAnalyticsOverview(workspace!.id, 14),
    enabled: Boolean(workspace),
  });

  const rollupMutation = useMutation({
    mutationFn: () => triggerAnalyticsRollup(workspace!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', workspace?.id] });
      toast.success("Today's analytics refreshed");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not refresh analytics')),
  });

  const sentiment = data ? sentimentDisplay(data.avgSentimentScore) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">How your AI and team are doing, last 14 days.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => rollupMutation.mutate()} disabled={rollupMutation.isPending}>
          {rollupMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh today
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversations</CardDescription>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <CardTitle className="text-3xl">{data?.totalConversations}</CardTitle>}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>AI resolution rate</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <CardTitle className="text-3xl">{Math.round((data?.resolutionRate ?? 0) * 100)}%</CardTitle>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Human takeover rate</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <CardTitle className="text-3xl">{Math.round((data?.takeoverRate ?? 0) * 100)}%</CardTitle>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Customer sentiment</CardDescription>
            {isLoading || !sentiment ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <CardTitle className="flex items-center gap-1.5 text-xl">
                <sentiment.Icon className="h-5 w-5" />
                {sentiment.label}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <TrendingUp className="h-4 w-4" />
            Conversation trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-56 w-full" /> : <TrendChart data={data?.trend ?? []} />}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4" />
              Common questions
            </CardTitle>
            <CardDescription>What customers are asking about most.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!isLoading && data?.topQuestions.length === 0 && (
              <p className="text-sm text-muted-foreground">Not enough conversations yet to spot trends.</p>
            )}
            {data?.topQuestions.map((q) => (
              <div key={q.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{q.label}</span>
                <Badge variant="secondary">{q.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Lightbulb className="h-4 w-4" />
              Knowledge gaps
            </CardTitle>
            <CardDescription>Topics the AI couldn't answer confidently.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isLoading && data?.knowledgeGaps.length === 0 && (
              <p className="text-sm text-muted-foreground">No knowledge gaps detected recently — nice work.</p>
            )}
            {data?.knowledgeGaps.map((g) => (
              <div key={g.label} className="flex items-center justify-between gap-3 rounded-md bg-warning/10 px-3 py-2 text-sm">
                <span className="truncate">
                  Customers asked about <span className="font-medium">{g.label}</span> {g.count} time
                  {g.count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
            {data && data.knowledgeGaps.length > 0 && (
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/dashboard/knowledge-base">Add to knowledge base</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
