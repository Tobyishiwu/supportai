# AI Architecture

## 1. Provider abstraction

Two narrow interfaces, defined once in `modules/ai/providers/types.ts`, with
one adapter per vendor. Business logic never imports a vendor SDK directly.

```ts
interface ChatProvider {
  readonly id: 'gemini' | 'openai' | 'groq' | 'openrouter';
  streamChat(input: ChatInput): AsyncIterable<ChatChunk>;
  complete(input: ChatInput): Promise<ChatResult>;
}

interface EmbeddingProvider {
  readonly id: 'gemini' | 'openai';
  embed(texts: string[]): Promise<number[][]>;
}
```

- `ChatInput` = `{ systemPrompt, messages, temperature, maxTokens }` — vendor
  differences (message shape, streaming protocol, function-calling syntax)
  are absorbed inside each adapter.
- `getChatProvider(workspaceAISetting)` / `getEmbeddingProvider(...)` are
  factory functions that read the workspace's `AISetting.provider` (falling
  back to a platform default + env-configured API key if the workspace
  hasn't set its own), so switching providers is a settings change, not a
  deploy.
- Adapters: `GeminiAdapter`, `OpenAIAdapter`, `GroqAdapter`,
  `OpenRouterAdapter` (OpenRouter/Groq both expose OpenAI-compatible chat
  APIs, so they share a base `OpenAICompatibleAdapter` with a different
  base URL/model list).

## 2. Grounded retrieval (RAG) — no hallucination

1. **Ingestion** (Phase 3): document → cleaned text → chunked (~500 tokens,
   overlap ~50) → embedded → stored as `KnowledgeChunk` with a vector index
   scoped to `(workspace, document)`.
2. **Retrieval** (Phase 4): incoming customer message is embedded, then
   MongoDB Atlas Vector Search finds the top-K chunks **filtered to that
   workspace** (never cross-tenant) ranked by cosine similarity.
3. **Grounded prompt**: the system prompt explicitly instructs the model to
   answer *only* using the provided chunks, to say it doesn't know
   otherwise, and to incorporate the workspace's custom instructions/tone
   from `AISetting.systemInstructions`. The retrieved chunks are injected as
   labeled context, not merged into free text, so the model can distinguish
   "ground truth" from "conversation history."
4. **Confidence gate**: if the top retrieval score is below
   `AISetting.confidenceThreshold`, or the model's own response matches a
   configured "I don't know" pattern, the orchestration service **overrides**
   the model output with the fixed fallback message and marks the
   conversation `needs_human` — this decision is deterministic code, not
   left to the model's discretion, so it can't be prompted around.
5. Every AI turn stores `usedChunks`, `provider`, `model`, and `confidence`
   on the `Message.aiMeta` — this is the same data the analytics module
   later mines for "knowledge gaps" (clusters of low-confidence turns).

## 3. Agent Copilot (Phase 6)

Runs on-demand when an agent opens a conversation (not proactively on every
message, to control cost):
- **Summary**: single completion over the conversation transcript.
- **Sentiment/category**: classification completion, cached on the
  `Conversation` document, invalidated on new customer messages.
- **Suggested reply**: same retrieval pipeline as the customer-facing AI,
  but the output is a *draft* the agent edits/sends — never auto-sent.
- **Relevant knowledge articles**: surfaces the source `KnowledgeDocument`s
  behind the retrieved chunks so the agent can verify/cite them.

## 4. Analytics generation (Phase 6)

A scheduled job (BullMQ + Redis) aggregates the day's `Message.aiMeta`
records per workspace into `Analytics` rollups, then runs one summarization
pass over the top low-confidence question clusters to produce the
plain-language insights shown on the dashboard ("consider adding a shipping
FAQ").

## 5. Cost & reliability controls

- Streaming responses (SSE/WebSocket) so the customer sees tokens
  immediately regardless of total generation time.
- Per-workspace rate limiting on AI endpoints (Redis token bucket) tied to
  `Subscription.messageQuota`.
- Provider timeouts + a single automatic retry with backoff; on repeated
  failure, the service degrades to the fixed fallback message rather than
  surfacing a raw error to the customer.
- All prompts are logged (workspace-scoped, PII-aware retention policy) for
  debugging and future fine-tuning/evals — never sent to a provider without
  the workspace's own retrieved context (no silent global-knowledge answers).
