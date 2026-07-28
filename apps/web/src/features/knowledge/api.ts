import { apiClient } from '@/services/api-client';
import type { KnowledgeDocument } from './types';

interface ApiEnvelope<T> {
  data: T;
}

export async function fetchDocuments(workspaceId: string): Promise<KnowledgeDocument[]> {
  const res = await apiClient.get<ApiEnvelope<KnowledgeDocument[]>>(`/workspaces/${workspaceId}/knowledge/documents`);
  return res.data.data;
}

export async function uploadFileDocument(
  workspaceId: string,
  input: { title: string; sourceType: 'pdf' | 'docx' | 'txt' | 'markdown'; file: File },
): Promise<KnowledgeDocument> {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('sourceType', input.sourceType);
  formData.append('file', input.file);

  const res = await apiClient.post<ApiEnvelope<KnowledgeDocument>>(
    `/workspaces/${workspaceId}/knowledge/documents`,
    formData,
  );
  return res.data.data;
}

export async function uploadUrlDocument(
  workspaceId: string,
  input: { title: string; sourceUrl: string },
): Promise<KnowledgeDocument> {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('sourceType', 'url');
  formData.append('sourceUrl', input.sourceUrl);

  const res = await apiClient.post<ApiEnvelope<KnowledgeDocument>>(
    `/workspaces/${workspaceId}/knowledge/documents`,
    formData,
  );
  return res.data.data;
}

export async function createFaq(
  workspaceId: string,
  input: { title: string; answer: string },
): Promise<KnowledgeDocument> {
  const res = await apiClient.post<ApiEnvelope<KnowledgeDocument>>(`/workspaces/${workspaceId}/knowledge/faqs`, input);
  return res.data.data;
}

export async function deleteDocument(workspaceId: string, documentId: string): Promise<void> {
  await apiClient.delete(`/workspaces/${workspaceId}/knowledge/documents/${documentId}`);
}
