import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

const analyticsSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    date: { type: Date, required: true, index: true },
    totalConversations: { type: Number, default: 0 },
    aiResolvedCount: { type: Number, default: 0 },
    humanTakeoverCount: { type: Number, default: 0 },
    avgSentimentScore: { type: Number, default: 0 },
    topQuestions: [
      {
        question: { type: String, required: true },
        count: { type: Number, required: true },
      },
    ],
    knowledgeGaps: [
      {
        topic: { type: String, required: true },
        count: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
);

analyticsSchema.index({ workspace: 1, date: 1 }, { unique: true });
analyticsSchema.plugin(toJSONPlugin);

export type AnalyticsDoc = HydratedDocument<InferSchemaType<typeof analyticsSchema>>;
export const Analytics = model('Analytics', analyticsSchema);
