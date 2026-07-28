import { createFileRoute } from '@tanstack/react-router';
import { TicketsPage } from '@/features/tickets/components/tickets-page';

export const Route = createFileRoute('/dashboard/tickets')({
  component: TicketsPage,
});
