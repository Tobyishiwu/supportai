# SupportAI — Product Architecture

## 1. What we're building

SupportAI is a multi-tenant SaaS help desk where each business ("workspace")
configures an AI support agent from its own knowledge base, and human agents
handle everything the AI can't resolve from a shared inbox. The AI never
answers from general knowledge — only from the workspace's ingested content —
and hands off to a human whenever it isn't confident.

## 2. System overview

```
                        ┌─────────────────────────┐
                        │   Marketing site (web)   │
                        └───────────┬─────────────┘
                                    │
┌───────────────┐    HTTPS/JSON     │        ┌─────────────────────┐
│  Dashboard SPA │───────────────────┼───────▶│   Express API (api)  │
│  (agents/admins)│◀──WebSocket──────┼────────│  modules/*           │
└───────────────┘                   │        └──────────┬──────────┘
                                    │                    │
┌───────────────┐                   │                    │
│ Embeddable     │───────────────────┘                    │
│ chat widget    │◀──WebSocket (Socket.IO)─────────────────┤
│ (end customers)│                                        │
└───────────────┘                                        │
                                                            ▼
                     ┌─────────────┐   ┌─────────┐   ┌────────────┐
                     │  MongoDB    │   │  Redis  │   │ AI Provider │
                     │  (Atlas)    │   │ (cache, │   │ Abstraction │
                     │             │   │ queues, │   │ (Gemini/    │
                     │             │   │ pub/sub)│   │ OpenAI/Groq/│
                     └─────────────┘   └─────────┘   │ OpenRouter) │
                                                      └────────────┘
                                                            │
                                                      ┌────────────┐
                                                      │ Cloudinary │
                                                      │ (files/img)│
                                                      └────────────┘
```

- **One Express application**, organized as feature modules, not a
  microservice mesh. At SupportAI's stage a modular monolith is faster to
  ship, easier to reason about, and still scales horizontally (stateless API
  pods behind a load balancer, Redis for shared state, MongoDB Atlas for
  storage). We split into services later only if a specific module (e.g.
  document ingestion) needs independent scaling.
- **Redis** is used for: refresh-token/session revocation lists, rate
  limiting counters, Socket.IO adapter (multi-instance pub/sub), and
  short-lived caches (AI settings, workspace lookups).
- **MongoDB** is the system of record. Every tenant-scoped collection carries
  a `workspace` field that is indexed and enforced at the query-builder
  level (see `database-design.md`).
- **AI provider abstraction** is a thin interface (`ChatProvider`,
  `EmbeddingProvider`) with adapters per vendor, so a workspace (or the
  platform default) can point at Gemini, OpenAI, Groq, or OpenRouter without
  touching business logic.

## 3. Multi-tenancy model

- Shared database, shared collections, **tenant column** (`workspace: ObjectId`)
  on every tenant-owned document — the standard, most cost-effective model
  for a mid-market SaaS at this stage (vs. DB-per-tenant, which doesn't pay
  off until much larger scale/compliance requirements).
- All tenant-scoped Mongoose queries go through repositories/services that
  require a `workspaceId` argument — there is no code path that queries
  `Conversation`, `Message`, `Customer`, `KnowledgeDocument`, etc. without it.
  A lint-level convention plus integration tests guard this (see
  `database-design.md` §"Tenant isolation").
- Auth middleware resolves the caller's active workspace membership and
  attaches `req.workspaceId` + `req.member` (with role/permissions) before
  any module handler runs.

## 4. Request lifecycle (dashboard/API request)

1. `helmet`, `cors`, request-id, structured logger (pino) middleware.
2. Global rate limiter (Redis-backed, per-IP + per-account tiers).
3. `authenticate` — verifies the access JWT, loads the user.
4. `resolveWorkspace` — verifies membership in the requested workspace,
   attaches role + permissions.
5. `requirePermission(...)` — RBAC guard per route.
6. Zod-validated controller → service (business logic) → Mongoose model.
7. Central error handler formats all errors as
   `{ error: { code, message, details? } }` and logs via the audit log for
   security-sensitive actions.

## 5. Chat request lifecycle (customer-facing AI)

1. Customer widget opens a Socket.IO connection scoped to
   `workspace:<id>:conversation:<id>`.
2. Message persisted (`Message`), then handed to the **AI orchestration
   service**: retrieve top-K knowledge chunks (vector search scoped to the
   workspace) → build a grounded prompt → call the configured `ChatProvider`
   → stream tokens back over the socket.
3. If retrieval confidence is below threshold, or the model reports it
   cannot answer from the provided context, the service short-circuits to
   the fixed fallback message and flags the conversation `needs_human`.
4. Every AI turn logs which chunks were used, the confidence score, and
   provider/latency — this powers the analytics module (knowledge gaps,
   resolution rate) without extra instrumentation later.

## 6. Why this stack

- **Express + TS + Mongoose**: fastest path to a robust modular API with a
  huge ecosystem; Mongoose schemas double as living documentation and give
  us validation, indexes, and middleware hooks (e.g. password hashing,
  audit-log side effects) for free.
- **MongoDB**: conversations/messages/knowledge chunks are naturally
  document-shaped and high write-volume; avoids premature relational joins
  for a domain that's still evolving.
- **Redis**: required for anything horizontally-scaled (rate limiting,
  socket fan-out, session/refresh revocation) — without it, JWT revocation
  and multi-instance websockets don't work correctly.
- **React 19 + Vite + TanStack Router/Query**: fully typed, file-light
  routing, first-class caching/streaming for a data-dense dashboard;
  Shadcn/Tailwind give us a premium, consistent design system without a
  heavyweight component library.
- **Provider-agnostic AI layer**: model quality/pricing shifts fast; workspaces
  should be able to switch providers (or fall back automatically) without a
  code change.

## 7. Build phases

| Phase | Scope |
|---|---|
| 1 | Foundation, architecture docs, auth, workspace + RBAC (this delivery) |
| 2 | Dashboard design system, shell, navigation |
| 3 | Knowledge base ingestion + processing + vector search |
| 4 | AI chatbot engine (grounded RAG, streaming, escalation) |
| 5 | Live chat inbox (assignment, notes, tags, statuses, websockets) |
| 6 | AI analytics + agent copilot |
| 7 | Deployment hardening + production polish |

Each phase ends with: the app running end-to-end, a written note on
decisions/trade-offs, and no unresolved TypeScript/lint errors.
