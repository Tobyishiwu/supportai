import { createFileRoute } from '@tanstack/react-router';
import { InvitesPage } from '@/features/workspace/components/invites-page';

export const Route = createFileRoute('/dashboard/invites')({
  component: InvitesPage,
});
