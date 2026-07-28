import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/auth-provider';
import { getApiErrorMessage } from '@/lib/api-error';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  workspaceName: z.string().trim().min(2, 'Enter your company name'),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await registerUser(values);
      await navigate({ to: '/dashboard' });
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Could not create your account'));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5 text-left">
        <h1 className="text-lg font-semibold">Create your workspace</h1>
        <p className="text-sm text-muted-foreground">Start resolving customer questions with AI in minutes.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" autoComplete="name" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="workspaceName">Company name</Label>
        <Input id="workspaceName" {...register('workspaceName')} />
        {errors.workspaceName && <p className="text-xs text-destructive">{errors.workspaceName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
