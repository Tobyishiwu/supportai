import { AppError } from '../../../common/errors/app-error.js';
import type { EmbeddingProvider } from './types.js';

const MODEL = 'text-embedding-3-small';
const API_URL = 'https://api.openai.com/v1/embeddings';

export class OpenAIEmbeddingAdapter implements EmbeddingProvider {
  readonly id = 'openai' as const;
  readonly dimensions = 1536;

  constructor(private readonly apiKey: string) {}

  async embed(texts: string[]): Promise<number[][]> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: MODEL, input: texts }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new AppError(502, 'INTERNAL_ERROR', `OpenAI embedding request failed: ${detail}`);
    }

    const body = (await response.json()) as { data: { embedding: number[] }[] };
    return body.data.map((d) => d.embedding);
  }
}
