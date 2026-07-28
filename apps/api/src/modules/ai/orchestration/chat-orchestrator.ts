import { AISetting } from '../../../models/ai-setting.model.js';
import { Conversation } from '../../../models/conversation.model.js';
import { Message } from '../../../models/message.model.js';
import { retrieveRelevantChunks } from '../../knowledge/knowledge.service.js';
import { getChatProvider, getEmbeddingProvider } from '../providers/factory.js';
import type { ChatMessage } from '../providers/types.js';

const HISTORY_LIMIT = 20;
const CONTEXT_CHUNK_LIMIT = 5;

export type OrchestrationEvent =
  | { type: 'delta'; delta: string }
  | { type: 'done'; confidence: number; needsHuman: boolean };

/**
 * Generates the AI's reply to the most recent customer message in a
 * conversation: retrieves grounded context, gates on confidence, and streams
 * the model's response. Assumes the customer's message is already saved.
 */
export async function* orchestrateReply(
  workspaceId: string,
  conversationId: string,
): AsyncGenerator<OrchestrationEvent> {
  const [aiSetting, conversation] = await Promise.all([
    AISetting.findOne({ workspace: workspaceId }),
    Conversation.findOne({ _id: conversationId, workspace: workspaceId }),
  ]);
  if (!aiSetting || !conversation) {
    throw new Error('AI settings or conversation not found for this workspace');
  }

  const history = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT);
  history.reverse();

  const lastCustomerMessage = [...history].reverse().find((m) => m.sender === 'customer');
  if (!lastCustomerMessage) throw new Error('No customer message to respond to');

  const embeddingProvider = getEmbeddingProvider();
  const [queryEmbedding] = await embeddingProvider.embed([lastCustomerMessage.body]);
  const chunks = queryEmbedding
    ? await retrieveRelevantChunks(workspaceId, queryEmbedding, CONTEXT_CHUNK_LIMIT)
    : [];
  const confidence = chunks[0]?.score ?? 0;

  if (chunks.length === 0 || confidence < aiSetting.confidenceThreshold) {
    await Message.create({
      workspace: workspaceId,
      conversation: conversationId,
      sender: 'ai',
      body: aiSetting.fallbackMessage,
      aiMeta: { confidence, usedChunks: [] },
    });
    conversation.aiConfidence = confidence;
    conversation.status = 'pending';
    conversation.lastMessageAt = new Date();
    await conversation.save();

    yield { type: 'delta', delta: aiSetting.fallbackMessage };
    yield { type: 'done', confidence, needsHuman: true };
    return;
  }

  const contextBlock = chunks.map((chunk, i) => `[${i + 1}] ${chunk.content}`).join('\n\n');
  const systemPrompt = [
    "You are SupportAI, a customer support assistant. Answer ONLY using the context below — never use outside knowledge or guess.",
    "If the context does not contain a clear answer, say you don't have enough information and that you'll connect the customer with a support agent.",
    aiSetting.systemInstructions ? `Business instructions: ${aiSetting.systemInstructions}` : null,
    `Context:\n${contextBlock}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const conversationMessages: ChatMessage[] = history.slice(-10).map((m) => ({
    role: m.sender === 'customer' ? 'user' : 'assistant',
    content: m.body,
  }));

  const chatProvider = getChatProvider(aiSetting.provider, aiSetting.model);

  let fullText = '';
  for await (const chunk of chatProvider.streamChat({
    messages: [{ role: 'system', content: systemPrompt }, ...conversationMessages],
    temperature: aiSetting.temperature,
  })) {
    fullText += chunk.delta;
    yield { type: 'delta', delta: chunk.delta };
  }

  await Message.create({
    workspace: workspaceId,
    conversation: conversationId,
    sender: 'ai',
    body: fullText,
    aiMeta: {
      provider: chatProvider.id,
      model: chatProvider.model,
      usedChunks: chunks.map((c) => c._id),
      confidence,
    },
  });

  conversation.aiConfidence = confidence;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  yield { type: 'done', confidence, needsHuman: false };
}
