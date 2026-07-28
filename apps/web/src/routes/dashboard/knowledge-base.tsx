import { createFileRoute } from '@tanstack/react-router';
import { BookOpen } from 'lucide-react';
import { ComingSoon } from '@/features/dashboard/components/coming-soon';

export const Route = createFileRoute('/dashboard/knowledge-base')({
  component: () => (
    <ComingSoon
      icon={BookOpen}
      title="Knowledge Base"
      description="Upload PDFs, DOCX, URLs, and FAQs — SupportAI will process and index them so the AI can answer from your content."
      phase="Ships in Phase 3"
    />
  ),
});
