import { createFileRoute } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { ComingSoon } from '@/features/dashboard/components/coming-soon';

export const Route = createFileRoute('/dashboard/ai-settings')({
  component: () => (
    <ComingSoon
      icon={Sparkles}
      title="AI Settings"
      description="Choose your AI provider, tune tone and instructions, and set the fallback message for questions it can't answer."
      phase="Ships in Phase 4"
    />
  ),
});
