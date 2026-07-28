import type { Request, Response } from 'express';
import * as tagService from './tag.service.js';

export async function list(req: Request, res: Response): Promise<void> {
  const tags = await tagService.listTags(req.workspaceId!);
  res.json({ data: tags });
}

export async function create(req: Request, res: Response): Promise<void> {
  const tag = await tagService.createTag(req.workspaceId!, req.body);
  res.status(201).json({ data: tag });
}
