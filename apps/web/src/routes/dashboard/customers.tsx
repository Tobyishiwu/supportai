import { createFileRoute } from '@tanstack/react-router';
import { UserSquare2 } from 'lucide-react';
import { ComingSoon } from '@/features/dashboard/components/coming-soon';

export const Route = createFileRoute('/dashboard/customers')({
  component: () => (
    <ComingSoon
      icon={UserSquare2}
      title="Customers"
      description="A directory of everyone who's talked to your support team, with their full conversation history."
      phase="Ships in Phase 5"
    />
  ),
});
