export type AIProvider = 'gemini' | 'openai' | 'groq' | 'openrouter';
export type AIChannel = 'widget' | 'email' | 'api';

export interface AISetting {
  id: string;
  provider: AIProvider;
  model: string;
  temperature: number;
  systemInstructions: string;
  fallbackMessage: string;
  confidenceThreshold: number;
  enabledChannels: AIChannel[];
}
