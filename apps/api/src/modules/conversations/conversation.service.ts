import { Types } from 'mongoose';
import { Conversation, type ConversationDoc } from '../../models/conversation.model.js';
import { Message, type MessageDoc } from '../../models/message.model.js';
import { AppError } from '../../common/errors/app-error.js';

const PAGE_SIZE = 20;

interface ListFilters {
  status?: 'open' | 'pending' | 'resolved' | 'closed';
  assignedTo?: string;
  tag?: string;
  cursor?: string;
}

export async function listConversations(
  workspaceId: string,
  filters: ListFilters,
): Promise<{ data: ConversationDoc[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = { workspace: workspaceId };
  if (filters.status) filter.status = filters.status;
  if (filters.assignedTo) filter.assignedTo = filters.assignedTo;
  if (filters.tag) filter.tags = filters.tag;
  if (filters.cursor) filter._id = { $lt: filters.cursor };

  const conversations = await Conversation.find(filter)
    .populate('customer', 'name email')
    .populate('assignedTo', 'name email avatarUrl')
    .populate('tags', 'name color')
    .sort({ lastMessageAt: -1, _id: -1 })
    .limit(PAGE_SIZE + 1);

  const hasMore = conversations.length > PAGE_SIZE;
  const page = hasMore ? conversations.slice(0, PAGE_SIZE) : conversations;
  const last = page.at(-1);

  return { data: page, nextCursor: hasMore && last ? String(last._id) : null };
}

export async function getConversation(
  workspaceId: string,
  conversationId: string,
): Promise<{ conversation: ConversationDoc; messages: MessageDoc[] }> {
  const conversation = await Conversation.findOne({ _id: conversationId, workspace: workspaceId })
    .populate('customer', 'name email phone metadata')
    .populate('assignedTo', 'name email avatarUrl')
    .populate('tags', 'name color');
  if (!conversation) throw AppError.notFound('Conversation not found');

  const messages = await Message.find({ conversation: conversationId })
    .populate('author', 'name email avatarUrl')
    .sort({ createdAt: 1 });

  return { conversation, messages };
}

export async function updateConversation(
  workspaceId: string,
  conversationId: string,
  updates: { assignedTo?: string | null; status?: ConversationDoc['status']; tags?: string[] },
): Promise<ConversationDoc> {
  const conversation = await Conversation.findOne({ _id: conversationId, workspace: workspaceId });
  if (!conversation) throw AppError.notFound('Conversation not found');

  if (updates.assignedTo !== undefined) {
    conversation.assignedTo = updates.assignedTo ? new Types.ObjectId(updates.assignedTo) : null;
  }
  if (updates.status) {
    conversation.status = updates.status;
    if (updates.status === 'resolved') conversation.resolvedAt = new Date();
  }
  if (updates.tags) conversation.tags = updates.tags as unknown as ConversationDoc['tags'];

  await conversation.save();
  return conversation.populate([
    { path: 'customer', select: 'name email' },
    { path: 'assignedTo', select: 'name email avatarUrl' },
    { path: 'tags', select: 'name color' },
  ]);
}

export async function createAgentMessage(
  workspaceId: string,
  conversationId: string,
  authorId: string,
  body: string,
  isInternalNote: boolean,
): Promise<MessageDoc> {
  const conversation = await Conversation.findOne({ _id: conversationId, workspace: workspaceId });
  if (!conversation) throw AppError.notFound('Conversation not found');

  const message = await Message.create({
    workspace: workspaceId,
    conversation: conversationId,
    sender: 'agent',
    author: authorId,
    body,
    isInternalNote,
  });

  if (!isInternalNote) {
    conversation.aiHandled = false;
    conversation.lastMessageAt = new Date();
  }
  await conversation.save();

  return message.populate('author', 'name email avatarUrl');
}

export async function forceHandoff(workspaceId: string, conversationId: string): Promise<ConversationDoc> {
  const conversation = await Conversation.findOne({ _id: conversationId, workspace: workspaceId });
  if (!conversation) throw AppError.notFound('Conversation not found');

  conversation.aiHandled = false;
  conversation.status = 'pending';
  await conversation.save();
  return conversation;
}
