export type KnowledgeSourceType = 'pdf' | 'docx' | 'txt' | 'markdown' | 'url' | 'faq';
export type KnowledgeStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface KnowledgeDocument {
  id: string;
  title: string;
  sourceType: KnowledgeSourceType;
  sourceUrl: string | null;
  storageUrl: string | null;
  status: KnowledgeStatus;
  error: string | null;
  chunkCount: number;
  uploadedBy: { id: string; name: string; email: string };
  createdAt: string;
}
