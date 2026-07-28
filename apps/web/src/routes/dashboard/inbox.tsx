import { createFileRoute } from '@tanstack/react-router';
import { Inbox } from 'lucide-react';
import { ComingSoon } from '@/features/dashboard/components/coming-soon';

export const Route = createFileRoute('/dashboard/inbox')({
  component: () => (
    <ComingSoon
      icon={Inbox}
      title="Live Chat Inbox"
      description="Reply to customers, assign conversations, add internal notes, and manage status — all in one place."
      phase="Ships in Phase 5"
    />
  ),
});
