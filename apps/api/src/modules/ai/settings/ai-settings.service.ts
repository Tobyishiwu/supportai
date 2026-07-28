import { AISetting, type AISettingDoc } from '../../../models/ai-setting.model.js';
import { AppError } from '../../../common/errors/app-error.js';

export async function getAISetting(workspaceId: string): Promise<AISettingDoc> {
  const setting = await AISetting.findOne({ workspace: workspaceId });
  if (!setting) throw AppError.notFound('AI settings not found for this workspace');
  return setting;
}

export async function updateAISetting(
  workspaceId: string,
  updates: Partial<
    Pick<
      AISettingDoc,
      'provider' | 'model' | 'temperature' | 'systemInstructions' | 'fallbackMessage' | 'confidenceThreshold' | 'enabledChannels'
    >
  >,
): Promise<AISettingDoc> {
  const setting = await AISetting.findOneAndUpdate({ workspace: workspaceId }, updates, { new: true });
  if (!setting) throw AppError.notFound('AI settings not found for this workspace');
  return setting;
}
