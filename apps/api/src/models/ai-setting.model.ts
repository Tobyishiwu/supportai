import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { toJSONPlugin } from './plugins/to-json.plugin.js';

export const AI_PROVIDERS = ['gemini', 'openai', 'groq', 'openrouter'] as const;
export type AIProvider = (typeof AI_PROVIDERS)[number];

const aiSettingSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, unique: true, index: true },
    provider: { type: String, enum: AI_PROVIDERS, default: 'gemini' },
    model: { type: String, default: 'gemini-2.0-flash' },
    temperature: { type: Number, default: 0.3, min: 0, max: 1 },
    systemInstructions: { type: String, default: '' },
    fallbackMessage: {
      type: String,
      default: "I don't have enough information to answer this. Let me connect you with a support agent.",
    },
    confidenceThreshold: { type: Number, default: 0.6, min: 0, max: 1 },
    enabledChannels: {
      type: [String],
      enum: ['widget', 'email', 'api'] as const,
      default: ['widget'],
    },
  },
  { timestamps: true },
);

aiSettingSchema.plugin(toJSONPlugin);

export type AISettingDoc = HydratedDocument<InferSchemaType<typeof aiSettingSchema>>;
export const AISetting = model('AISetting', aiSettingSchema);
