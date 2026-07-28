import { z } from 'zod';
import { Analytics, type AnalyticsDoc } from '../../models/analytics.model.js';
import { Conversation } from '../../models/conversation.model.js';
import { Message } from '../../models/message.model.js';
import { Workspace } from '../../models/workspace.model.js';
import { AISetting } from '../../models/ai-setting.model.js';
import { getChatProvider } from '../ai/providers/factory.js';
import { completeChat } from '../ai/providers/complete.js';
import { logger } from '../../config/logger.js';

const LOW_CONFIDENCE_THRESHOLD = 0.5;
const SENTIMENT_SCORE: Record<string, number> = { positive: 1, neutral: 0, negative: -1 };

const insightSchema = z.object({
  topQuestions: z.array(z.object({ question: z.string(), count: z.number() })).max(5),
  knowledgeGaps: z.array(z.object({ topic: z.string(), count: z.number() })).max(5),
});

function parseJsonResponse(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
  return JSON.parse(cleaned);
}

function dayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function generateInsights(
  workspaceId: string,
  allQuestions: string[],
  gapQuestions: string[],
): Promise<{ topQuestions: { question: string; count: number }[]; knowledgeGaps: { topic: string; count: number }[] }> {
  if (allQuestions.length === 0) return { topQuestions: [], knowledgeGaps: [] };

  const aiSetting = await AISetting.findOne({ workspace: workspaceId });
  if (!aiSetting) return { topQuestions: [], knowledgeGaps: [] };

  try {
    const chatProvider = getChatProvider(aiSetting.provider, aiSetting.model);
    const raw = await completeChat(chatProvider, {
      messages: [
        {
          role: 'system',
          content:
            'You cluster customer support questions into recurring themes. Respond with ONLY JSON: ' +
            '{"topQuestions": [{"question": "short theme", "count": n}], "knowledgeGaps": [{"topic": "short theme", "count": n}]}. ' +
            'Counts are how many of the listed messages relate to each theme. At most 5 items per array. Empty arrays if there is nothing notable.',
        },
        {
          role: 'user',
          content: `All customer questions today:\n${allQuestions.join('\n')}\n\nQuestions from conversations the AI could not answer confidently:\n${
            gapQuestions.join('\n') || '(none)'
          }`,
        },
      ],
      temperature: 0.3,
      maxTokens: 600,
    });

    return insightSchema.parse(parseJsonResponse(raw));
  } catch (error) {
    logger.error({ err: error, workspaceId }, 'Failed to generate analytics insights; continuing without them');
    return { topQuestions: [], knowledgeGaps: [] };
  }
}

export async function generateRollupForDate(workspaceId: string, date: Date): Promise<AnalyticsDoc> {
  const { start, end } = dayRange(date);
  const createdInRange = { workspace: workspaceId, createdAt: { $gte: start, $lt: end } };

  const [totalConversations, aiResolvedCount, humanTakeoverCount, sentimentConversations] = await Promise.all([
    Conversation.countDocuments(createdInRange),
    Conversation.countDocuments({ ...createdInRange, aiHandled: true, status: { $in: ['resolved', 'closed'] } }),
    Conversation.countDocuments({ ...createdInRange, aiHandled: false }),
    Conversation.find({ ...createdInRange, sentiment: { $ne: null } }, 'sentiment'),
  ]);

  const avgSentimentScore = sentimentConversations.length
    ? sentimentConversations.reduce((sum, c) => sum + (SENTIMENT_SCORE[c.sentiment ?? 'neutral'] ?? 0), 0) /
      sentimentConversations.length
    : 0;

  const customerMessages = await Message.find(
    { workspace: workspaceId, sender: 'customer', createdAt: { $gte: start, $lt: end } },
    'body conversation',
  ).limit(200);

  const lowConfidenceAiMessages = await Message.find(
    {
      workspace: workspaceId,
      sender: 'ai',
      createdAt: { $gte: start, $lt: end },
      'aiMeta.confidence': { $lt: LOW_CONFIDENCE_THRESHOLD },
    },
    'conversation',
  ).limit(200);

  const gapConversationIds = new Set(lowConfidenceAiMessages.map((m) => String(m.conversation)));
  const allQuestions = customerMessages.map((m) => m.body);
  const gapQuestions = customerMessages.filter((m) => gapConversationIds.has(String(m.conversation))).map((m) => m.body);

  const { topQuestions, knowledgeGaps } = await generateInsights(workspaceId, allQuestions, gapQuestions);

  return Analytics.findOneAndUpdate(
    { workspace: workspaceId, date: start },
    { totalConversations, aiResolvedCount, humanTakeoverCount, avgSentimentScore, topQuestions, knowledgeGaps },
    { upsert: true, new: true },
  );
}

export async function generateRollupForAllWorkspaces(date: Date): Promise<void> {
  const workspaces = await Workspace.find({}, '_id');
  for (const workspace of workspaces) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await generateRollupForDate(String(workspace._id), date);
    } catch (error) {
      logger.error({ err: error, workspaceId: String(workspace._id) }, 'Failed to generate analytics rollup');
    }
  }
}

function mergeCounts<T extends string>(
  items: { label: T; count: number }[],
): { label: T; count: number }[] {
  const totals = new Map<T, number>();
  for (const item of items) {
    totals.set(item.label, (totals.get(item.label) ?? 0) + item.count);
  }
  return [...totals.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export interface AnalyticsOverview {
  totalConversations: number;
  aiResolvedCount: number;
  humanTakeoverCount: number;
  resolutionRate: number;
  takeoverRate: number;
  avgSentimentScore: number;
  trend: { date: string; totalConversations: number; aiResolvedCount: number; humanTakeoverCount: number }[];
  topQuestions: { label: string; count: number }[];
  knowledgeGaps: { label: string; count: number }[];
}

export async function getOverview(workspaceId: string, days = 14): Promise<AnalyticsOverview> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const rollups = await Analytics.find({ workspace: workspaceId, date: { $gte: since } }).sort({ date: 1 });

  const totals = rollups.reduce(
    (acc, r) => ({
      totalConversations: acc.totalConversations + r.totalConversations,
      aiResolvedCount: acc.aiResolvedCount + r.aiResolvedCount,
      humanTakeoverCount: acc.humanTakeoverCount + r.humanTakeoverCount,
    }),
    { totalConversations: 0, aiResolvedCount: 0, humanTakeoverCount: 0 },
  );

  const avgSentimentScore = rollups.length
    ? rollups.reduce((sum, r) => sum + r.avgSentimentScore, 0) / rollups.length
    : 0;

  return {
    ...totals,
    resolutionRate: totals.totalConversations ? totals.aiResolvedCount / totals.totalConversations : 0,
    takeoverRate: totals.totalConversations ? totals.humanTakeoverCount / totals.totalConversations : 0,
    avgSentimentScore,
    trend: rollups.map((r) => ({
      date: r.date.toISOString(),
      totalConversations: r.totalConversations,
      aiResolvedCount: r.aiResolvedCount,
      humanTakeoverCount: r.humanTakeoverCount,
    })),
    topQuestions: mergeCounts(rollups.flatMap((r) => r.topQuestions.map((q) => ({ label: q.question, count: q.count })))),
    knowledgeGaps: mergeCounts(rollups.flatMap((r) => r.knowledgeGaps.map((g) => ({ label: g.topic, count: g.count })))),
  };
}
