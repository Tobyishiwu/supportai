import { createFileRoute } from '@tanstack/react-router';
import { AnalyticsPage } from '@/features/analytics/components/analytics-page';

export const Route = createFileRoute('/dashboard/analytics')({
  component: AnalyticsPage,
});
