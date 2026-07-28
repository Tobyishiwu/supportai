import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/layouts/auth-layout';
import { RegisterForm } from '@/features/auth/components/register-form';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
