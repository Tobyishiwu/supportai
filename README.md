# SupportAI

AI-powered customer support platform — an AI chatbot grounded in your own
knowledge base, a live chat inbox with an agent copilot, and support
analytics, for multi-tenant businesses.

Architecture and design docs live in [`docs/`](./docs):
[product architecture](./docs/architecture.md) ·
[database design](./docs/database-design.md) ·
[API design](./docs/api-design.md) ·
[folder structure](./docs/folder-structure.md) ·
[user flows](./docs/user-flows.md) ·
[AI architecture](./docs/ai-architecture.md) ·
[deployment guide](./docs/deployment.md)

## Stack

- **API** (`apps/api`): Node.js, Express, TypeScript, MongoDB/Mongoose, Redis, Socket.IO, BullMQ, JWT
- **Web** (`apps/web`): React 19, Vite, TypeScript, Tailwind v4, shadcn/ui, TanStack Router/Query
- **AI**: provider-agnostic (Gemini, OpenAI, Groq, OpenRouter) for both chat and embeddings

## Features

- **AI customer chat** — grounded RAG over your own knowledge base only, with
  a confidence gate that hands off to a human instead of guessing
- **Knowledge base** — upload PDF/DOCX/TXT/Markdown, submit a URL, or write an
  FAQ; processed asynchronously (extract → chunk → embed) via a BullMQ worker
- **Live chat inbox** — real-time (Socket.IO) conversation list, assignment,
  internal notes, tags, statuses
- **AI agent copilot** — on-demand conversation summary/sentiment and a
  grounded suggested reply, right in the inbox
- **Support analytics** — resolution/takeover rates, sentiment trend, and an
  LLM-generated "knowledge gap" insight feed
- **Customers & tickets** — a searchable customer directory and an
  independent ticket board for escalated issues
- **Multi-tenant workspaces** — RBAC (owner/agent), full tenant isolation,
  audit logging

## Getting started

Requires Node 20+, pnpm 10+, and Docker (for local MongoDB/Redis).

```bash
pnpm install
docker compose up -d          # MongoDB (single-node replica set) on :27017, Redis on :6379
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm dev:api                  # http://localhost:4000
pnpm dev:web                  # http://localhost:5173
```

Set at least `GEMINI_API_KEY` (or `OPENAI_API_KEY`) in `apps/api/.env` to
exercise the AI chat/knowledge features — everything else works without an
AI key configured (auth, workspaces, team, inbox UI, tickets).

## Testing

Both apps have a real automated test suite (Vitest):

```bash
pnpm test              # both apps
pnpm --filter @supportai/api test   # backend only: unit tests (jwt, password,
                                     # slugify, chunking, validation schemas)
                                     # + Supertest integration tests (auth guard,
                                     # request validation, health check) — no
                                     # live MongoDB required, but a reachable
                                     # Redis is assumed, same as local dev
pnpm --filter @supportai/web test   # frontend only: unit tests (cn, API error
                                     # mapping) + component/form tests
                                     # (Button, LoginForm) via Testing Library
```

## Deploying

See [`docs/deployment.md`](./docs/deployment.md) for the full path to a live
instance on MongoDB Atlas + Cloudinary + Render (`render.yaml` blueprint
included) + Vercel (`apps/web/vercel.json` included).

## Status

All seven build phases are implemented: foundation/auth/workspaces, the
dashboard design system, knowledge base ingestion, the AI chatbot engine,
the live chat inbox, AI analytics + agent copilot, and deployment
configuration. See `docs/architecture.md` for the phase-by-phase breakdown
and the architectural reasoning behind each.
