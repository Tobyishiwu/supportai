import { createFileRoute } from '@tanstack/react-router';
import { KnowledgeBasePage } from '@/features/knowledge/components/knowledge-base-page';

export const Route = createFileRoute('/dashboard/knowledge-base')({
  component: KnowledgeBasePage,
});
