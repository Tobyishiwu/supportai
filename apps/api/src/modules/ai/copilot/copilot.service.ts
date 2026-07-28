import { z } from 'zod';
import { Conversation } from '../../../models/conversation.model.js';
import { Message } from '../../../models/message.model.js';
import { AISetting } from '../../../models/ai-setting.model.js';
import { KnowledgeDocument } from '../../../models/knowledge-document.model.js';
import { AppError } from '../../../common/errors/app-error.js';
import { retrieveRelevantChunks } from '../../knowledge/knowledge.service.js';
import { getChatProvider, getEmbeddingProvider } from '../providers/factory.js';
import { completeChat } from '../providers/complete.js';

const HISTORY_LIMIT = 30;

const analysisSchema = z.object({
  summary: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  category: z.string(),
});

function parseJsonResponse(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
  return JSON.parse(cleaned);
}

async function loadContext(workspaceId: string, conversationId: string) {
  const [aiSetting, conversation] = await Promise.all([
    AISetting.findOne({ workspace: workspaceId }),
    Conversation.findOne({ _id: conversationId, workspace: workspaceId }),
  ]);
  if (!aiSetting || !conversation) throw AppError.notFound('Conversation or AI settings not found');

  const messages = await Message.find({ conversation: conversationId, isInternalNote: false })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT);
  messages.reverse();

  return { aiSetting, conversation, messages };
}

export interface ConversationAnalysis {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
}

export async function analyzeConversation(workspaceId: string, conversationId: string): Promise<ConversationAnalysis> {
  const { aiSetting, conversation, messages } = await loadContext(workspaceId, conversationId);
  if (messages.length === 0) throw AppError.validation('Conversation has no messages to analyze');

  const transcript = messages.map((m) => `${m.sender}: ${m.body}`).join('\n');
  const chatProvider = getChatProvider(aiSetting.provider, aiSetting.model);

  const raw = await completeChat(chatProvider, {
    messages: [
      {
        role: 'system',
        content:
          'You are a support analyst. Respond with ONLY a JSON object (no markdown, no commentary): ' +
          '{"summary": "one or two sentence summary", "sentiment": "positive"|"neutral"|"negative", "category": "short complaint/topic category"}',
      },
      { role: 'user', content: transcript },
    ],
    temperature: 0.2,
    maxTokens: 300,
  });

  let parsed: ConversationAnalysis;
  try {
    parsed = analysisSchema.parse(parseJsonResponse(raw));
  } catch {
    throw new AppError(502, 'INTERNAL_ERROR', 'The AI returned an unexpected response. Please try again.');
  }

  conversation.sentiment = parsed.sentiment;
  await conversation.save();

  return parsed;
}

export interface SuggestedReply {
  suggestion: string;
  usedArticles: { id: string; title: string }[];
}

export async function suggestReply(workspaceId: string, conversationId: string): Promise<SuggestedReply> {
  const { aiSetting, messages } = await loadContext(workspaceId, conversationId);
  const lastCustomerMessage = [...messages].reverse().find((m) => m.sender === 'customer');
  if (!lastCustomerMessage) throw AppError.validation('No customer message to reply to');

  const embeddingProvider = getEmbeddingProvider();
  const [queryEmbedding] = await embeddingProvider.embed([lastCustomerMessage.body]);
  const chunks = queryEmbedding ? await retrieveRelevantChunks(workspaceId, queryEmbedding, 5) : [];

  const contextBlock = chunks.length
    ? chunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n')
    : '(no matching knowledge base content found)';

  const conversationMessages = messages.slice(-10).map((m) => ({
    role: (m.sender === 'customer' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.body,
  }));

  const chatProvider = getChatProvider(aiSetting.provider, aiSetting.model);
  const suggestion = await completeChat(chatProvider, {
    messages: [
      {
        role: 'system',
        content: [
          "Draft a reply for a human support agent to review, edit, and send — do not address the customer as if you're certain unless the context supports it.",
          'Prefer the knowledge base context below when relevant; otherwise draft a helpful, honest reply the agent can adjust.',
          aiSetting.systemInstructions ? `Business tone/instructions: ${aiSetting.systemInstructions}` : null,
          `Knowledge base context:\n${contextBlock}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
      ...conversationMessages,
    ],
    temperature: aiSetting.temperature,
    maxTokens: 400,
  });

  const documentIds = [...new Set(chunks.map((c) => String(c.document)))];
  const documents = documentIds.length
    ? await KnowledgeDocument.find({ _id: { $in: documentIds } }, 'title')
    : [];

  return {
    suggestion,
    usedArticles: documents.map((d) => ({ id: String(d._id), title: d.title })),
  };
}
