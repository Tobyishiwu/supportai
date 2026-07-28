import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/layouts/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
