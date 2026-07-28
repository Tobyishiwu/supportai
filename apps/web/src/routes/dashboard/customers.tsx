import { createFileRoute } from '@tanstack/react-router';
import { CustomersPage } from '@/features/customers/components/customers-page';

export const Route = createFileRoute('/dashboard/customers')({
  component: CustomersPage,
});
