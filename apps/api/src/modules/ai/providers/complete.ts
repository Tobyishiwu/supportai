import type { ChatInput, ChatProvider } from './types.js';

/** Consumes a ChatProvider's stream fully and returns the joined text — for one-shot, non-streamed uses (copilot, analytics). */
export async function completeChat(provider: ChatProvider, input: ChatInput): Promise<string> {
  let text = '';
  for await (const chunk of provider.streamChat(input)) {
    text += chunk.delta;
  }
  return text;
}
