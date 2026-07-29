import { AppError } from '../../../common/errors/app-error.js';
import type { EmbeddingProvider } from './types.js';

const MODEL = 'gemini-embedding-001';
const DIMENSIONS = 768;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent`;

export class GeminiEmbeddingAdapter implements EmbeddingProvider {
  readonly id = 'gemini' as const;
  readonly dimensions = DIMENSIONS;

  constructor(private readonly apiKey: string) {}

  // Google retired the synchronous batch-embed endpoint; embedContent only
  // takes one piece of content per call, so chunks are embedded in parallel.
  async embed(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embedOne(text)));
  }

  private async embedOne(text: string): Promise<number[]> {
    const response = await fetch(`${API_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: DIMENSIONS,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new AppError(502, 'INTERNAL_ERROR', `Gemini embedding request failed: ${detail}`);
    }

    const body = (await response.json()) as { embedding: { values: number[] } };
    return body.embedding.values;
  }
}
