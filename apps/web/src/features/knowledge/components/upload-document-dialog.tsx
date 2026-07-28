import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileUp, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createFaq, uploadFileDocument, uploadUrlDocument } from '@/features/knowledge/api';
import { getApiErrorMessage } from '@/lib/api-error';

const titleSchema = z.object({
  title: z.string().trim().min(2, 'Enter a title'),
});
const urlSchema = z.object({
  title: z.string().trim().min(2, 'Enter a title'),
  sourceUrl: z.string().trim().url('Enter a valid URL'),
});
const faqSchema = z.object({
  title: z.string().trim().min(2, 'Enter a question or title'),
  answer: z.string().trim().min(2, 'Enter the answer'),
});

const EXTENSION_TO_SOURCE_TYPE: Record<string, 'pdf' | 'docx' | 'txt' | 'markdown'> = {
  pdf: 'pdf',
  docx: 'docx',
  txt: 'txt',
  md: 'markdown',
  markdown: 'markdown',
};

function FileUploadForm({ workspaceId, onDone }: { workspaceId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof titleSchema>>({ resolver: zodResolver(titleSchema) });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof titleSchema>) => {
      if (!file) throw new Error('Choose a file');
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      const sourceType = EXTENSION_TO_SOURCE_TYPE[extension];
      if (!sourceType) throw new Error('Unsupported file type. Use PDF, DOCX, TXT, or Markdown.');
      return uploadFileDocument(workspaceId, { title: values.title, sourceType, file });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', workspaceId, 'documents'] });
      toast.success('Document uploaded — processing has started');
      onDone();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not upload document')),
  });

  return (
    <form
      onSubmit={handleSubmit((v) => {
        if (!file) {
          setFileError('Choose a file');
          return;
        }
        setFileError(null);
        mutation.mutate(v);
      })}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="file-title">Title</Label>
        <Input id="file-title" {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="file-input">File (PDF, DOCX, TXT, Markdown)</Label>
        <label
          htmlFor="file-input"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-input px-4 py-6 text-center text-sm text-muted-foreground hover:bg-accent/40"
        >
          <FileUp className="h-5 w-5" />
          {file ? file.name : 'Click to choose a file'}
        </label>
        <input
          id="file-input"
          type="file"
          accept=".pdf,.docx,.txt,.md,.markdown"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {fileError && <p className="text-xs text-destructive">{fileError}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Upload
      </Button>
    </form>
  );
}

function UrlForm({ workspaceId, onDone }: { workspaceId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof urlSchema>>({ resolver: zodResolver(urlSchema) });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof urlSchema>) => uploadUrlDocument(workspaceId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', workspaceId, 'documents'] });
      toast.success('URL submitted — processing has started');
      onDone();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not submit URL')),
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="url-title">Title</Label>
        <Input id="url-title" {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="url-source">Page URL</Label>
        <Input id="url-source" placeholder="https://example.com/faq" {...register('sourceUrl')} />
        {errors.sourceUrl && <p className="text-xs text-destructive">{errors.sourceUrl.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit URL
      </Button>
    </form>
  );
}

function FaqForm({ workspaceId, onDone }: { workspaceId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof faqSchema>>({ resolver: zodResolver(faqSchema) });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof faqSchema>) => createFaq(workspaceId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', workspaceId, 'documents'] });
      toast.success('FAQ added to the knowledge base');
      onDone();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not save FAQ')),
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="faq-title">Question</Label>
        <Input id="faq-title" placeholder="What's your return policy?" {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="faq-answer">Answer</Label>
        <Textarea id="faq-answer" rows={4} {...register('answer')} />
        {errors.answer && <p className="text-xs text-destructive">{errors.answer.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Add FAQ
      </Button>
    </form>
  );
}

export function UploadDocumentDialog({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add knowledge
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to knowledge base</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="file">
          <TabsList>
            <TabsTrigger value="file">File</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          <TabsContent value="file">
            <FileUploadForm workspaceId={workspaceId} onDone={close} />
          </TabsContent>
          <TabsContent value="url">
            <UrlForm workspaceId={workspaceId} onDone={close} />
          </TabsContent>
          <TabsContent value="faq">
            <FaqForm workspaceId={workspaceId} onDone={close} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
