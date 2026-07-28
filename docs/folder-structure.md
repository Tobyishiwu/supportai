# Folder Structure

Monorepo managed with pnpm workspaces — independent deploy targets
(`apps/api` → Render, `apps/web` → Vercel) sharing tooling/config at the root.

```
exam-prep-app/
├── docs/                          product/db/api/AI architecture (this folder)
├── apps/
│   ├── api/                       backend — Express + TypeScript
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/          register/login/refresh/logout
│   │   │   │   ├── users/         user profile
│   │   │   │   ├── workspaces/    workspace, membership, roles/RBAC
│   │   │   │   ├── conversations/ inbox: conversations + messages
│   │   │   │   ├── knowledge/     document upload, processing, retrieval
│   │   │   │   ├── ai/            provider abstraction + orchestration
│   │   │   │   ├── analytics/     rollups + insight generation
│   │   │   │   ├── tickets/       escalated issue tracking
│   │   │   │   └── notifications/ in-app notifications
│   │   │   │       each module: *.routes.ts, *.controller.ts,
│   │   │   │       *.service.ts, *.validation.ts, *.types.ts
│   │   │   ├── models/            Mongoose schemas (shared across modules)
│   │   │   ├── common/
│   │   │   │   ├── middleware/    auth, rbac, error-handler, rate-limit, validate
│   │   │   │   ├── errors/        typed AppError hierarchy
│   │   │   │   └── utils/         pagination, async-handler, logger helpers
│   │   │   ├── config/            env loading + validation (zod)
│   │   │   ├── db/                mongo + redis connection bootstrapping
│   │   │   ├── app.ts              express app assembly (middleware + routes)
│   │   │   └── server.ts           process entrypoint
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                       frontend — React 19 + Vite + TypeScript
│       ├── src/
│       │   ├── features/          one folder per domain (auth, workspaces,
│       │   │                      inbox, knowledge, analytics, marketing…):
│       │   │                      components/, hooks/, api.ts (queries/mutations)
│       │   ├── components/        shared UI (shadcn primitives + composites)
│       │   ├── layouts/           DashboardLayout, MarketingLayout, AuthLayout
│       │   ├── routes/            TanStack Router route tree
│       │   ├── hooks/             cross-feature hooks (useAuth, useWorkspace)
│       │   ├── services/          axios instance, websocket client
│       │   ├── providers/         QueryClientProvider, AuthProvider, ThemeProvider
│       │   └── utils/             formatting, cn(), constants
│       ├── package.json
│       └── tsconfig.json
├── package.json                    workspace root (scripts fan out to apps/*)
├── pnpm-workspace.yaml
└── docker-compose.yml               local MongoDB + Redis for development
```

Rationale: feature-based modules on both sides keep a domain's routes,
validation, and UI together so a single phase of work (e.g. "knowledge
base") touches one folder per app instead of scattering across generic
`controllers/`, `models/`, `views/` buckets that don't scale past a handful
of resources.
