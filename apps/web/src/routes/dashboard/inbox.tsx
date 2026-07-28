import { createFileRoute } from '@tanstack/react-router';
import { InboxPage } from '@/features/inbox/components/inbox-page';

export const Route = createFileRoute('/dashboard/inbox')({
  component: InboxPage,
});
