export interface TrendPoint {
  date: string;
  totalConversations: number;
  aiResolvedCount: number;
  humanTakeoverCount: number;
}

export interface LabeledCount {
  label: string;
  count: number;
}

export interface AnalyticsOverview {
  totalConversations: number;
  aiResolvedCount: number;
  humanTakeoverCount: number;
  resolutionRate: number;
  takeoverRate: number;
  avgSentimentScore: number;
  trend: TrendPoint[];
  topQuestions: LabeledCount[];
  knowledgeGaps: LabeledCount[];
}
