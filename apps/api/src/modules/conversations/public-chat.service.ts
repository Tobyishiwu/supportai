import { Customer } from '../../models/customer.model.js';
import { Conversation, type ConversationDoc } from '../../models/conversation.model.js';
import { Message, type MessageDoc } from '../../models/message.model.js';
import { AISetting } from '../../models/ai-setting.model.js';
import { signWidgetToken } from '../../common/auth/widget-jwt.js';
import { AppError } from '../../common/errors/app-error.js';

export async function startConversation(
  workspaceId: string,
  input: { name?: string; email?: string },
): Promise<{ token: string; conversationId: string; customerId: string }> {
  const aiSetting = await AISetting.findOne({ workspace: workspaceId });
  if (!aiSetting?.enabledChannels.includes('widget')) {
    throw AppError.forbidden('The chat widget is not enabled for this workspace');
  }

  const customer = await Customer.create({
    workspace: workspaceId,
    name: input.name ?? null,
    email: input.email ?? null,
  });

  const conversation = await Conversation.create({
    workspace: workspaceId,
    customer: customer._id,
    channel: 'widget',
  });

  const token = signWidgetToken({
    workspaceId,
    customerId: String(customer._id),
    conversationId: String(conversation._id),
  });

  return { token, conversationId: String(conversation._id), customerId: String(customer._id) };
}

export async function saveCustomerMessage(
  workspaceId: string,
  conversationId: string,
  body: string,
): Promise<MessageDoc> {
  const conversation = await Conversation.findOne({ _id: conversationId, workspace: workspaceId });
  if (!conversation) throw AppError.notFound('Conversation not found');

  const message = await Message.create({
    workspace: workspaceId,
    conversation: conversationId,
    sender: 'customer',
    body,
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  return message;
}

export async function getConversationHistory(
  workspaceId: string,
  conversationId: string,
): Promise<{ conversation: ConversationDoc; messages: MessageDoc[] }> {
  const conversation = await Conversation.findOne({ _id: conversationId, workspace: workspaceId });
  if (!conversation) throw AppError.notFound('Conversation not found');

  const messages = await Message.find({ conversation: conversationId, isInternalNote: false }).sort({
    createdAt: 1,
  });

  return { conversation, messages };
}
