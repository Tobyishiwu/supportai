import { createFileRoute } from '@tanstack/react-router';
import { AISettingsPage } from '@/features/ai-settings/components/ai-settings-page';

export const Route = createFileRoute('/dashboard/ai-settings')({
  component: AISettingsPage,
});
