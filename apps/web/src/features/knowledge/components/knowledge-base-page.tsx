import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileCode,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWorkspace } from '@/features/workspace/workspace-provider';
import { deleteDocument, fetchDocuments } from '@/features/knowledge/api';
import type { KnowledgeDocument, KnowledgeStatus } from '@/features/knowledge/types';
import { getApiErrorMessage } from '@/lib/api-error';
import { UploadDocumentDialog } from './upload-document-dialog';

const SOURCE_ICONS: Record<KnowledgeDocument['sourceType'], typeof FileText> = {
  pdf: FileText,
  docx: FileText,
  txt: FileCode,
  markdown: FileCode,
  url: LinkIcon,
  faq: HelpCircle,
};

const STATUS_VARIANT: Record<KnowledgeStatus, 'secondary' | 'warning' | 'success' | 'destructive'> = {
  pending: 'secondary',
  processing: 'warning',
  ready: 'success',
  failed: 'destructive',
};

export function KnowledgeBasePage() {
  const { workspace, hasPermission } = useWorkspace();
  const queryClient = useQueryClient();
  const canManage = hasPermission('knowledge:manage');

  const { data: documents, isLoading } = useQuery({
    queryKey: ['knowledge', workspace?.id, 'documents'],
    queryFn: () => fetchDocuments(workspace!.id),
    enabled: Boolean(workspace),
    refetchInterval: (query) => {
      const docs = query.state.data;
      const hasInFlight = docs?.some((d) => d.status === 'pending' || d.status === 'processing');
      return hasInFlight ? 3000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => deleteDocument(workspace!.id, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', workspace?.id, 'documents'] });
      toast.success('Document removed');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not remove document')),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload docs, FAQs, and URLs — the AI answers customers only from what&apos;s here.
          </p>
        </div>
        {canManage && workspace && <UploadDocumentDialog workspaceId={workspace.id} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {documents?.length ?? 0} document{documents?.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Chunks</TableHead>
                <TableHead>Added</TableHead>
                {canManage && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={canManage ? 5 : 4}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && documents?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canManage ? 5 : 4} className="py-10 text-center text-sm text-muted-foreground">
                    No knowledge added yet. Upload a document, submit a URL, or add an FAQ to get started.
                  </TableCell>
                </TableRow>
              )}

              {documents?.map((doc) => {
                const Icon = SOURCE_ICONS[doc.sourceType];
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs uppercase text-muted-foreground">{doc.sourceType}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[doc.status]} className="gap-1 capitalize">
                        {doc.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                        {doc.status}
                      </Badge>
                      {doc.status === 'failed' && doc.error && (
                        <p className="mt-1 max-w-xs text-xs text-destructive">{doc.error}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.chunkCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(doc.id)}
                          aria-label="Delete document"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
