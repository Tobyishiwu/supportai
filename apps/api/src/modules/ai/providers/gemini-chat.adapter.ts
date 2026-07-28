import { AppError } from '../../../common/errors/app-error.js';
import { parseSSEStream } from './sse.js';
import type { ChatInput, ChatProvider, ChatStreamChunk } from './types.js';

interface GeminiStreamChunk {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

export class GeminiChatAdapter implements ChatProvider {
  readonly id = 'gemini' as const;

  constructor(
    private readonly apiKey: string,
    readonly model: string,
  ) {}

  async *streamChat(input: ChatInput): AsyncIterable<ChatStreamChunk> {
    const systemMessages = input.messages.filter((m) => m.role === 'system');
    const conversation = input.messages.filter((m) => m.role !== 'system');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: systemMessages.length
          ? { parts: [{ text: systemMessages.map((m) => m.content).join('\n\n') }] }
          : undefined,
        contents: conversation.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: input.temperature,
          maxOutputTokens: input.maxTokens ?? 1024,
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new AppError(502, 'INTERNAL_ERROR', `Gemini chat request failed: ${detail}`);
    }

    for await (const data of parseSSEStream(response)) {
      const parsed = JSON.parse(data) as GeminiStreamChunk;
      const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) yield { delta: text };
    }
  }
}
