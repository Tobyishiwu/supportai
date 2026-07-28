import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/features/workspace/components/settings-page';

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
});
