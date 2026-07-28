import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/features/workspace/workspace-provider';
import { updateWorkspace } from '@/features/workspace/api';
import { getApiErrorMessage } from '@/lib/api-error';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter a workspace name'),
  industry: z.string().trim().max(60).optional(),
});

type FormValues = z.infer<typeof schema>;

export function SettingsPage() {
  const { workspace, hasPermission } = useWorkspace();
  const canManage = hasPermission('settings:manage');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: workspace ? { name: workspace.name, industry: workspace.industry ?? '' } : undefined,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => updateWorkspace(workspace!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', 'mine'] });
      toast.success('Workspace settings saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not save changes')),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your workspace profile.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace profile</CardTitle>
          <CardDescription>Visible to your team across the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Workspace name</Label>
              <Input id="name" disabled={!canManage} {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" placeholder="e.g. E-commerce, Hospitality" disabled={!canManage} {...register('industry')} />
            </div>

            {canManage && (
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
