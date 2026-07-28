import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createTicket } from '@/features/tickets/api';
import { fetchCustomers } from '@/features/customers/api';
import { getApiErrorMessage } from '@/lib/api-error';

const schema = z.object({
  title: z.string().trim().min(2, 'Enter a title'),
  description: z.string().trim().optional(),
  customerId: z.string().min(1, 'Choose a customer'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateTicketDialog({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = React.useState(false);
  const [customerSearch, setCustomerSearch] = React.useState('');
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers', workspaceId, customerSearch],
    queryFn: () => fetchCustomers(workspaceId, customerSearch || undefined),
    enabled: open,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { priority: 'medium' } });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createTicket(workspaceId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', workspaceId] });
      toast.success('Ticket created');
      setOpen(false);
      reset();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not create ticket')),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New ticket
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ticket-title">Title</Label>
            <Input id="ticket-title" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticket-customer">Customer</Label>
            <Input
              id="ticket-customer"
              placeholder="Search by name or email..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-border p-1">
                  {customers?.length === 0 && (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground">No customers found</p>
                  )}
                  {customers?.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => field.onChange(customer.id)}
                      className={`w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent ${
                        field.value === customer.id ? 'bg-accent' : ''
                      }`}
                    >
                      {customer.name ?? customer.email ?? 'Anonymous'}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g. Billing" {...register('category')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
