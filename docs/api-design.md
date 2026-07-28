# API Design

Base URL: `/api/v1`. JSON only (`application/json`), except file uploads
(`multipart/form-data`) and the streaming AI endpoint (`text/event-stream`).

## Conventions

- **Auth**: short-lived access JWT (15 min) in `Authorization: Bearer`,
  long-lived refresh JWT (30 days) in an `httpOnly`, `Secure`, `SameSite=Strict`
  cookie. Refresh rotates on every use; the previous token is revoked
  (Redis denylist keyed by `jti`).
- **Workspace scoping**: authenticated routes under `/workspaces/:workspaceId/...`.
  Middleware verifies the caller is an active member of `:workspaceId` before
  any handler runs; there is no "current workspace" implied by session state
  server-side (the client sends it explicitly, server always re-checks).
- **Errors**: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`,
  standard HTTP status codes (400/401/403/404/409/422/429/500).
- **Pagination**: cursor-based for high-volume lists (`?cursor=&limit=`),
  offset-based for small admin lists (`?page=&limit=`). Response shape:
  `{ data: [...], pageInfo: { nextCursor, hasMore } }`.
- **Idempotency**: mutating endpoints that can be safely retried (e.g.
  sending a message) accept an `Idempotency-Key` header.
- **Rate limits**: per-IP on auth endpoints (brute-force protection),
  per-workspace on AI endpoints (cost control), returned via
  `X-RateLimit-*` headers.

## Auth — `/api/v1/auth`

| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create user + first workspace |
| POST | `/login` | Email/password → access token + refresh cookie |
| POST | `/refresh` | Rotate refresh cookie → new access token |
| POST | `/logout` | Revoke refresh token |
| GET | `/me` | Current user + workspace memberships |

## Workspaces — `/api/v1/workspaces`

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create a new workspace (becomes owner) |
| GET | `/` | List workspaces the caller belongs to |
| GET | `/:workspaceId` | Workspace details |
| PATCH | `/:workspaceId` | Update settings (requires `settings:manage`) |
| GET | `/:workspaceId/members` | List members |
| POST | `/:workspaceId/members/invite` | Invite by email + role |
| PATCH | `/:workspaceId/members/:memberId` | Change role / status |
| DELETE | `/:workspaceId/members/:memberId` | Remove member |
| GET | `/:workspaceId/roles` | List roles + permissions |

## Knowledge — `/api/v1/workspaces/:workspaceId/knowledge` *(Phase 3)*

| Method | Path | Description |
|---|---|---|
| POST | `/documents` | Upload file or submit URL for ingestion |
| GET | `/documents` | List documents + processing status |
| DELETE | `/documents/:id` | Remove document + its chunks |
| POST | `/faqs` | Create FAQ entry (title + answer → chunked directly) |

## Conversations / Inbox — `/api/v1/workspaces/:workspaceId/conversations` *(Phase 5)*

| Method | Path | Description |
|---|---|---|
| GET | `/` | List/filter by status, assignee, tag |
| GET | `/:id` | Conversation + messages |
| POST | `/:id/messages` | Agent reply / internal note |
| PATCH | `/:id` | Assign, change status, tag |
| POST | `/:id/handoff` | Force AI → human handoff |

Widget-facing (public, rate-limited, no dashboard auth — customer-scoped
session token instead): `/api/v1/public/:workspaceSlug/chat/*`.

## AI — `/api/v1/workspaces/:workspaceId/ai` *(Phase 4/6)*

| Method | Path | Description |
|---|---|---|
| GET / PATCH | `/settings` | Provider, model, instructions, thresholds |
| POST | `/conversations/:id/suggest-reply` | Copilot suggestion for an agent |
| POST | `/conversations/:id/summarize` | Summary + sentiment + category |

## Analytics — `/api/v1/workspaces/:workspaceId/analytics` *(Phase 6)*

| Method | Path | Description |
|---|---|---|
| GET | `/overview` | Totals, resolution rate, CSAT, takeover rate |
| GET | `/trends` | Time series for charts |
| GET | `/knowledge-gaps` | Unanswered/low-confidence question clusters |

## Tickets — `/api/v1/workspaces/:workspaceId/tickets` *(Phase 5)*

Standard CRUD + `PATCH /:id` for status/priority/assignee changes.

## Versioning & stability

`/api/v1` is additive-only once a phase ships (new optional fields, new
endpoints); breaking changes require `/api/v2`. Internal-only endpoints
(webhooks, background job triggers) live under `/api/v1/internal` and require
a service-to-service key, never a user JWT.
