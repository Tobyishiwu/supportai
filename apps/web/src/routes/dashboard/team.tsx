import { createFileRoute } from '@tanstack/react-router';
import { TeamPage } from '@/features/workspace/components/team-page';

export const Route = createFileRoute('/dashboard/team')({
  component: TeamPage,
});
