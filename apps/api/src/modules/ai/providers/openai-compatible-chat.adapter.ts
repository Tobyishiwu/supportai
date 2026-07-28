import { AppError } from '../../../common/errors/app-error.js';
import { parseSSEStream } from './sse.js';
import type { ChatInput, ChatProvider, ChatProviderId, ChatStreamChunk } from './types.js';

interface OpenAICompatibleStreamChunk {
  choices?: { delta?: { content?: string } }[];
}

/** OpenAI, Groq, and OpenRouter all expose the same chat-completions streaming shape. */
export class OpenAICompatibleChatAdapter implements ChatProvider {
  constructor(
    readonly id: ChatProviderId,
    private readonly baseUrl: string,
    private readonly apiKey: string,
    readonly model: string,
  ) {}

  async *streamChat(input: ChatInput): AsyncIterable<ChatStreamChunk> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        stream: true,
        temperature: input.temperature,
        max_tokens: input.maxTokens ?? 1024,
        messages: input.messages,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new AppError(502, 'INTERNAL_ERROR', `${this.id} chat request failed: ${detail}`);
    }

    for await (const data of parseSSEStream(response)) {
      const parsed = JSON.parse(data) as OpenAICompatibleStreamChunk;
      const text = parsed.choices?.[0]?.delta?.content;
      if (text) yield { delta: text };
    }
  }
}
