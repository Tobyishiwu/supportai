import { env } from '../../../config/env.js';
import { AppError } from '../../../common/errors/app-error.js';
import type { ChatProvider, ChatProviderId, EmbeddingProvider, EmbeddingProviderId } from './types.js';
import { GeminiEmbeddingAdapter } from './gemini-embedding.adapter.js';
import { OpenAIEmbeddingAdapter } from './openai-embedding.adapter.js';
import { GeminiChatAdapter } from './gemini-chat.adapter.js';
import { OpenAICompatibleChatAdapter } from './openai-compatible-chat.adapter.js';

const OPENAI_COMPATIBLE_BASE_URLS: Record<'openai' | 'groq' | 'openrouter', string> = {
  openai: 'https://api.openai.com/v1',
  groq: 'https://api.groq.com/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
};

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

/** Resolves the chat provider for a workspace's AISetting (provider + model). */
export function getChatProvider(provider: ChatProviderId, model: string): ChatProvider {
  if (provider === 'gemini') {
    if (!env.GEMINI_API_KEY) throw AppError.validation('GEMINI_API_KEY is not configured');
    return new GeminiChatAdapter(env.GEMINI_API_KEY, model);
  }

  const apiKeyByProvider: Record<'openai' | 'groq' | 'openrouter', string | undefined> = {
    openai: env.OPENAI_API_KEY,
    groq: env.GROQ_API_KEY,
    openrouter: env.OPENROUTER_API_KEY,
  };
  const apiKey = apiKeyByProvider[provider];
  if (!apiKey) throw AppError.validation(`API key for provider "${provider}" is not configured`);

  return new OpenAICompatibleChatAdapter(provider, OPENAI_COMPATIBLE_BASE_URLS[provider], apiKey, model);
}
