# SupportAI

AI-powered customer support platform — chatbot, live chat inbox, knowledge
base, and support analytics for multi-tenant businesses.

Architecture and design docs live in [`docs/`](./docs):
[product architecture](./docs/architecture.md) ·
[database design](./docs/database-design.md) ·
[API design](./docs/api-design.md) ·
[folder structure](./docs/folder-structure.md) ·
[user flows](./docs/user-flows.md) ·
[AI architecture](./docs/ai-architecture.md)

## Stack

- **API** (`apps/api`): Node.js, Express, TypeScript, MongoDB/Mongoose, Redis, JWT
- **Web** (`apps/web`): React 19, Vite, TypeScript, Tailwind, shadcn/ui, TanStack Router/Query
- **AI**: provider-agnostic (Gemini, OpenAI, Groq, OpenRouter)

## Getting started

Requires Node 20+, pnpm 10+, and Docker (for local MongoDB/Redis).

```bash
pnpm install
docker compose up -d          # MongoDB on :27017, Redis on :6379
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm dev:api                  # http://localhost:4000
pnpm dev:web                  # http://localhost:5173
```

## Status

Phase 1 (foundation, architecture, auth, workspace/RBAC) is implemented.
See `docs/architecture.md` for the full phase roadmap.
