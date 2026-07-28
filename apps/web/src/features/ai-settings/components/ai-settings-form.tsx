import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace } from '@/features/workspace/workspace-provider';
import { fetchAISettings, updateAISettings } from '@/features/ai-settings/api';
import type { AIChannel } from '@/features/ai-settings/types';
import { getApiErrorMessage } from '@/lib/api-error';

const schema = z.object({
  provider: z.enum(['gemini', 'openai', 'groq', 'openrouter']),
  model: z.string().trim().min(1, 'Enter a model name'),
  temperature: z.coerce.number().min(0).max(1),
  confidenceThreshold: z.coerce.number().min(0).max(1),
  systemInstructions: z.string().max(4000).optional(),
  fallbackMessage: z.string().trim().min(1, 'Enter a fallback message'),
  enabledChannels: z.array(z.enum(['widget', 'email', 'api'])),
});

type FormValues = z.infer<typeof schema>;

const CHANNELS: { value: AIChannel; label: string }[] = [
  { value: 'widget', label: 'Chat widget' },
  { value: 'email', label: 'Email' },
  { value: 'api', label: 'API' },
];

export function AISettingsForm({ workspaceId }: { workspaceId: string }) {
  const { hasPermission } = useWorkspace();
  const canManage = hasPermission('settings:manage');
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['ai-settings', workspaceId],
    queryFn: () => fetchAISettings(workspaceId),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: settings
      ? {
          provider: settings.provider,
          model: settings.model,
          temperature: settings.temperature,
          confidenceThreshold: settings.confidenceThreshold,
          systemInstructions: settings.systemInstructions,
          fallbackMessage: settings.fallbackMessage,
          enabledChannels: settings.enabledChannels,
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => updateAISettings(workspaceId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings', workspaceId] });
      toast.success('AI settings saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not save AI settings')),
  });

  const enabledChannels = useWatch({ control, name: 'enabledChannels' }) ?? [];
  const temperature = useWatch({ control, name: 'temperature' });
  const confidenceThreshold = useWatch({ control, name: 'confidenceThreshold' });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 py-6">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI configuration</CardTitle>
        <CardDescription>
          Controls how the AI answers customers. It only ever answers from your knowledge base.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="provider">Provider</Label>
              <Controller
                control={control}
                name="provider"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!canManage}>
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="groq">Groq</SelectItem>
                      <SelectItem value="openrouter">OpenRouter</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input id="model" placeholder="gemini-2.0-flash" disabled={!canManage} {...register('model')} />
              {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="temperature">Temperature ({temperature})</Label>
              <input
                id="temperature"
                type="range"
                min={0}
                max={1}
                step={0.05}
                disabled={!canManage}
                {...register('temperature')}
                className="w-full accent-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confidenceThreshold">Confidence threshold ({confidenceThreshold})</Label>
              <input
                id="confidenceThreshold"
                type="range"
                min={0}
                max={1}
                step={0.05}
                disabled={!canManage}
                {...register('confidenceThreshold')}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="systemInstructions">Custom instructions</Label>
            <Textarea
              id="systemInstructions"
              rows={4}
              placeholder="e.g. Always mention our 30-day return policy when relevant. Keep a friendly, concise tone."
              disabled={!canManage}
              {...register('systemInstructions')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fallbackMessage">Fallback message</Label>
            <Textarea id="fallbackMessage" rows={2} disabled={!canManage} {...register('fallbackMessage')} />
            {errors.fallbackMessage && (
              <p className="text-xs text-destructive">{errors.fallbackMessage.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Enabled channels</Label>
            <Controller
              control={control}
              name="enabledChannels"
              render={({ field }) => (
                <div className="flex flex-wrap gap-4">
                  {CHANNELS.map((channel) => (
                    <label key={channel.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        disabled={!canManage}
                        checked={enabledChannels.includes(channel.value)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...field.value, channel.value]
                            : field.value.filter((v) => v !== channel.value);
                          field.onChange(next);
                        }}
                      />
                      {channel.label}
                    </label>
                  ))}
                </div>
              )}
            />
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
  );
}
