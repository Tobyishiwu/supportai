export type EmbeddingProviderId = 'gemini' | 'openai';

export interface EmbeddingProvider {
  readonly id: EmbeddingProviderId;
  readonly dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
}
