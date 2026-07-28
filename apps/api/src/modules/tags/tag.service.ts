import { Tag, type TagDoc } from '../../models/tag.model.js';
import { AppError } from '../../common/errors/app-error.js';

export async function listTags(workspaceId: string): Promise<TagDoc[]> {
  return Tag.find({ workspace: workspaceId }).sort({ name: 1 });
}

export async function createTag(workspaceId: string, input: { name: string; color?: string }): Promise<TagDoc> {
  const existing = await Tag.findOne({ workspace: workspaceId, name: input.name });
  if (existing) throw AppError.conflict('A tag with this name already exists');

  return Tag.create({ workspace: workspaceId, name: input.name, color: input.color });
}
