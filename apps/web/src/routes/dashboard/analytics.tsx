import { createFileRoute } from '@tanstack/react-router';
import { BarChart3 } from 'lucide-react';
import { ComingSoon } from '@/features/dashboard/components/coming-soon';

export const Route = createFileRoute('/dashboard/analytics')({
  component: () => (
    <ComingSoon
      icon={BarChart3}
      title="Support Analytics"
      description="Resolution rate, CSAT, sentiment trends, and AI-generated insights like knowledge gaps in your content."
      phase="Ships in Phase 6"
    />
  ),
});
