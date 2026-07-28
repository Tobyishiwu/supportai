export type EmbeddingProviderId = 'gemini' | 'openai';

export interface EmbeddingProvider {
  readonly id: EmbeddingProviderId;
  readonly dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
}

export type ChatProviderId = 'gemini' | 'openai' | 'groq' | 'openrouter';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatInput {
  messages: ChatMessage[];
  temperature: number;
  maxTokens?: number;
}

export interface ChatStreamChunk {
  delta: string;
}

export interface ChatProvider {
  readonly id: ChatProviderId;
  readonly model: string;
  streamChat(input: ChatInput): AsyncIterable<ChatStreamChunk>;
}
