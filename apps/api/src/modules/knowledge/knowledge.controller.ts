import type { Request, Response } from 'express';
import * as knowledgeService from './knowledge.service.js';
import { AppError } from '../../common/errors/app-error.js';
import { recordAudit } from '../../common/utils/audit.js';

export async function createDocument(req: Request, res: Response): Promise<void> {
  const { title, sourceType, sourceUrl } = req.body as {
    title: string;
    sourceType: 'pdf' | 'docx' | 'txt' | 'markdown' | 'url';
    sourceUrl?: string;
  };

  const doc = await knowledgeService.createDocument({
    workspaceId: req.workspaceId!,
    uploadedBy: req.auth!.userId,
    title,
    sourceType,
    sourceUrl,
    file: req.file ? { buffer: req.file.buffer, originalName: req.file.originalname } : undefined,
  });

  await recordAudit({
    req,
    action: 'knowledge.document.create',
    workspace: req.workspaceId,
    actor: req.auth!.userId,
    targetType: 'KnowledgeDocument',
    targetId: String(doc._id),
    metadata: { sourceType, title },
  });

  res.status(201).json({ data: doc });
}

export async function createFaq(req: Request, res: Response): Promise<void> {
  const doc = await knowledgeService.createFaq({
    workspaceId: req.workspaceId!,
    uploadedBy: req.auth!.userId,
    title: req.body.title,
    answer: req.body.answer,
  });

  await recordAudit({
    req,
    action: 'knowledge.faq.create',
    workspace: req.workspaceId,
    actor: req.auth!.userId,
    targetType: 'KnowledgeDocument',
    targetId: String(doc._id),
  });

  res.status(201).json({ data: doc });
}

export async function listDocuments(req: Request, res: Response): Promise<void> {
  const documents = await knowledgeService.listDocuments(req.workspaceId!);
  res.json({ data: documents });
}

export async function deleteDocument(req: Request, res: Response): Promise<void> {
  const documentId = req.params.documentId;
  if (!documentId) throw AppError.validation('documentId is required');

  await knowledgeService.deleteDocument(req.workspaceId!, documentId);
  await recordAudit({
    req,
    action: 'knowledge.document.delete',
    workspace: req.workspaceId,
    actor: req.auth!.userId,
    targetType: 'KnowledgeDocument',
    targetId: documentId,
  });
  res.status(204).send();
}
