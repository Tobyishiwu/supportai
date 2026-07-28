import { AppError } from '../../../common/errors/app-error.js';
import type { EmbeddingProvider } from './types.js';

const MODEL = 'text-embedding-004';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:batchEmbedContents`;

export class GeminiEmbeddingAdapter implements EmbeddingProvider {
  readonly id = 'gemini' as const;
  readonly dimensions = 768;

  constructor(private readonly apiKey: string) {}

  async embed(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${API_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model: `models/${MODEL}`,
          content: { parts: [{ text }] },
        })),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new AppError(502, 'INTERNAL_ERROR', `Gemini embedding request failed: ${detail}`);
    }

    const body = (await response.json()) as { embeddings: { values: number[] }[] };
    return body.embeddings.map((e) => e.values);
  }
}
