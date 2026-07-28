import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { inviteMember } from '@/features/workspace/api';
import { getApiErrorMessage } from '@/lib/api-error';

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  roleName: z.enum(['agent', 'owner']),
});

type FormValues = z.infer<typeof schema>;

export function InviteMemberDialog({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { roleName: 'agent' } });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => inviteMember(workspaceId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'members'] });
      setOpen(false);
      reset();
    },
    onError: (error) => setServerError(getApiErrorMessage(error, 'Could not send the invite')),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4" />
          Invite teammate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => {
            setServerError(null);
            mutation.mutate(values);
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              {...register('roleName')}
            >
              <option value="agent">Agent</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
