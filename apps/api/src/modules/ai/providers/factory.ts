import { env } from '../../../config/env.js';
import { AppError } from '../../../common/errors/app-error.js';
import type { EmbeddingProvider, EmbeddingProviderId } from './types.js';
import { GeminiEmbeddingAdapter } from './gemini-embedding.adapter.js';
import { OpenAIEmbeddingAdapter } from './openai-embedding.adapter.js';

/**
 * Resolves the embedding provider to use. Prefers an explicit workspace
 * preference, falling back to whichever provider has an API key configured
 * so the platform works out of the box with a single key set.
 */
export function getEmbeddingProvider(preferred?: EmbeddingProviderId): EmbeddingProvider {
  const provider = preferred ?? (env.GEMINI_API_KEY ? 'gemini' : 'openai');

  if (provider === 'gemini') {
    if (!env.GEMINI_API_KEY) throw AppError.validation('GEMINI_API_KEY is not configured');
    return new GeminiEmbeddingAdapter(env.GEMINI_API_KEY);
  }

  if (!env.OPENAI_API_KEY) throw AppError.validation('OPENAI_API_KEY is not configured');
  return new OpenAIEmbeddingAdapter(env.OPENAI_API_KEY);
}
