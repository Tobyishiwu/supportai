import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';
import { AuthLayout } from '@/layouts/auth-layout';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

const searchSchema = z.object({
  token: z.string().catch(''),
});

export const Route = createFileRoute('/reset-password')({
  validateSearch: searchSchema,
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();

  return (
    <AuthLayout>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-4 text-left">
          <h1 className="text-lg font-semibold">Invalid reset link</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is missing or invalid. Request a new one below.
          </p>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Request a new link
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
