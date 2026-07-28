# Database Design

MongoDB via Mongoose. All collections that belong to a tenant carry a
`workspace: ObjectId` field (indexed, usually as the first field of a
compound index) except `User`, which is global (a person can belong to
multiple workspaces via `WorkspaceMember`).

Conventions:
- All schemas: `timestamps: true`, `toJSON` transform strips `__v` and maps
  `_id` → `id`.
- Soft-delete via `deletedAt: Date | null` on entities agents can restore
  (Ticket, KnowledgeDocument); hard delete elsewhere.
- Enums are TypeScript string-literal unions shared between Mongoose schema
  and Zod validators (single source of truth in `modules/*/*.types.ts`).

## Tenant isolation

Every service method that touches a tenant-scoped collection takes
`workspaceId` as an explicit, required argument (never optional, never
inferred from the document body) and includes it in every `find`,
`findOne`, `updateOne`, `deleteOne` filter. This is enforced by:
1. Route middleware attaching `req.workspaceId` from the authenticated
   membership — never trusting a `workspaceId` in the request body/params
   for authorization purposes.
2. Compound indexes starting with `workspace` so tenant-scoped queries are
   always index-covered and cross-tenant scans are structurally impossible
   to write efficiently (a nudge toward the correct query shape).

## Collections

### User
Global identity. Auth lives here; workspace-specific role/status lives in
`WorkspaceMember`.
```
_id
email            (unique, lowercase, indexed)
passwordHash
name
avatarUrl
isEmailVerified  boolean
lastLoginAt
status           'active' | 'suspended'
```

### Workspace
```
_id
name
slug             (unique, indexed) — used for widget embed + subdomain-free routing
industry         string (free-form; platform is industry-agnostic)
logoUrl
timezone
billingEmail
subscription     ObjectId -> Subscription
settings: {
  brandColor
  widgetGreeting
  businessHours
}
```

### WorkspaceMember
The join between User and Workspace; carries the role for that workspace.
```
_id
workspace   ObjectId (indexed)
user        ObjectId (indexed)
role        ObjectId -> Role
status      'invited' | 'active' | 'removed'
invitedBy   ObjectId -> User
joinedAt
unique compound index: (workspace, user)
```

### Role
Roles are per-workspace so businesses can define custom roles later; two
system roles (`owner`, `agent`) are seeded on workspace creation and cannot
be deleted.
```
_id
workspace     ObjectId (indexed, null for system-wide default templates)
name          string
isSystem      boolean
permissions   [ObjectId] -> Permission
```

### Permission
Static, platform-defined, seeded once at boot (not per-workspace).
```
_id
key          string unique, e.g. "conversations:reply", "knowledge:manage",
             "team:manage", "settings:manage", "analytics:view", "tickets:manage"
description
```

### Conversation
```
_id
workspace       ObjectId (indexed)
customer        ObjectId -> Customer (indexed)
assignedTo      ObjectId -> User | null
status          'open' | 'pending' | 'resolved' | 'closed'  (indexed)
channel         'widget' | 'email' | 'api'
tags            [ObjectId] -> Tag
sentiment       'positive' | 'neutral' | 'negative' | null
aiHandled       boolean          — true until first human reply
aiConfidence    number | null    — last AI turn's retrieval confidence
lastMessageAt   Date (indexed, for inbox sort)
resolvedAt
compound index: (workspace, status, lastMessageAt)
```

### Message
```
_id
workspace       ObjectId (indexed)
conversation    ObjectId (indexed)
sender          'customer' | 'ai' | 'agent'
author          ObjectId -> User | null (null for customer/ai)
body            string
attachments     [{ url, type, name }]   — Cloudinary URLs
isInternalNote  boolean          — agent-only notes, never shown to customer
aiMeta: {
  provider, model, usedChunks: [ObjectId -> KnowledgeChunk], confidence
}
compound index: (conversation, createdAt)
```

### Customer
The end-user talking to the AI/agents — not a platform User.
```
_id
workspace     ObjectId (indexed)
name
email         (indexed)
phone
externalId    string | null   — for API-integrated identification
metadata      Mixed           — arbitrary business-supplied attributes
firstSeenAt
lastSeenAt
compound index: (workspace, email)
```

### KnowledgeDocument
```
_id
workspace     ObjectId (indexed)
title
sourceType    'pdf' | 'docx' | 'txt' | 'markdown' | 'url' | 'faq'
sourceUrl     string | null
storageUrl    string | null   — Cloudinary raw asset
status        'pending' | 'processing' | 'ready' | 'failed'  (indexed)
error         string | null
chunkCount    number
uploadedBy    ObjectId -> User
deletedAt     Date | null
```

### KnowledgeChunk
The retrieval unit. Vector index lives on `embedding`.
```
_id
workspace     ObjectId (indexed)
document      ObjectId -> KnowledgeDocument (indexed)
content       string
embedding     number[]        — Atlas Vector Search index (workspace, document filter)
tokenCount    number
order         number          — position within source document
compound index: (workspace, document, order)
```

### AISetting
Per-workspace AI configuration — one document per workspace.
```
_id
workspace         ObjectId (unique, indexed)
provider          'gemini' | 'openai' | 'groq' | 'openrouter'
model             string
temperature       number
systemInstructions string       — business-supplied tone/policy overrides
fallbackMessage   string        — shown when AI can't answer
confidenceThreshold number
enabledChannels   ['widget','email','api']
```

### Tag
```
_id
workspace   ObjectId (indexed)
name
color
unique compound index: (workspace, name)
```

### Ticket
Escalated/tracked issues distinct from the live conversation thread (e.g. a
refund request that outlives the chat).
```
_id
workspace     ObjectId (indexed)
conversation  ObjectId -> Conversation
customer      ObjectId -> Customer
title
description
priority      'low' | 'medium' | 'high' | 'urgent'
status        'open' | 'in_progress' | 'resolved' | 'closed'  (indexed)
assignedTo    ObjectId -> User | null
category      string | null   — AI-suggested complaint category
deletedAt     Date | null
```

### Analytics
Precomputed daily rollups per workspace (written by a scheduled job, read by
the dashboard — avoids expensive aggregation queries on every page load).
```
_id
workspace          ObjectId (indexed)
date                Date (indexed, day granularity)
totalConversations
aiResolvedCount
humanTakeoverCount
avgSentimentScore
topQuestions        [{ question, count }]
knowledgeGaps       [{ topic, count }]
unique compound index: (workspace, date)
```

### AuditLog
Append-only, immutable.
```
_id
workspace     ObjectId (indexed, null for platform-level events)
actor         ObjectId -> User | null
action        string   e.g. "auth.login", "workspace.member.invite"
targetType    string | null
targetId      ObjectId | null
metadata      Mixed
ip
userAgent
createdAt (indexed, TTL-free — retained for compliance)
```

### Subscription
```
_id
workspace       ObjectId (unique, indexed)
plan            'free' | 'starter' | 'growth' | 'enterprise'
status          'active' | 'trialing' | 'past_due' | 'canceled'
seats
messageQuota
currentPeriodEnd
provider        'stripe'
providerCustomerId
providerSubscriptionId
```

### APIKey
For programmatic/API channel integrations.
```
_id
workspace     ObjectId (indexed)
name
keyHash       string (never store raw key; show once on creation)
prefix        string  — short, non-secret, for display ("sk_live_ab12")
scopes        [string]
lastUsedAt
revokedAt     Date | null
```

### Notification
In-app notifications for agents (assignment, mention, SLA breach).
```
_id
workspace     ObjectId (indexed)
user          ObjectId -> User (indexed)
type          string
payload       Mixed
readAt        Date | null
compound index: (user, readAt, createdAt)
```
