import { createFileRoute } from '@tanstack/react-router';
import { Ticket } from 'lucide-react';
import { ComingSoon } from '@/features/dashboard/components/coming-soon';

export const Route = createFileRoute('/dashboard/tickets')({
  component: () => (
    <ComingSoon
      icon={Ticket}
      title="Tickets"
      description="Track escalated issues — like refunds or complaints — independently of the live chat thread they came from."
      phase="Ships in Phase 5"
    />
  ),
});
