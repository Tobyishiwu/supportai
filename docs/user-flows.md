# Key User Flows

## 1. Business signup & onboarding
1. Sign up with email/password (or later: OAuth) → `User` created.
2. Prompted to create a workspace (name, industry) → `Workspace` +
   `WorkspaceMember` (role `owner`) + default `AISetting` + system roles
   (`owner`, `agent`) seeded in one transaction.
3. Guided setup: add company info/FAQs → upload first knowledge doc →
   install the chat widget snippet. Each step is skippable; dashboard shows
   a completion checklist (not a blocking wizard).

## 2. Inviting teammates
1. Owner/admin invites teammate by email + role from **Team** settings.
2. `WorkspaceMember` created with `status: invited`; invite email sent.
3. Invitee accepts (existing account → auto-join; new email → register
   then auto-join) → `status: active`.

## 3. Customer chat (AI-first)
1. Visitor opens the embedded widget on the business's site → anonymous
   `Customer` created/matched by widget session, `Conversation` opened.
2. Customer asks a question (optionally attaches a screenshot).
3. AI orchestration retrieves relevant `KnowledgeChunk`s for that workspace,
   answers **only** from them, and streams the response.
4. If confidence is low / no relevant chunks found: AI replies with the
   fixed fallback message and flags `needs_human`; conversation surfaces at
   the top of the live inbox.
5. Customer can request a human at any point ("Talk to a person") — same
   handoff path.

## 4. Agent handles a conversation (Live Chat Inbox)
1. Agent opens Inbox, filtered by status/assignee/tag.
2. Opening a conversation loads the **Agent Copilot** panel: customer
   summary, past conversations, sentiment, suggested reply, relevant
   knowledge articles.
3. Agent replies, adds an internal note, tags the conversation, or reassigns.
4. Agent marks `resolved` → conversation leaves the active queue but stays
   searchable; `closed` after customer confirms/timeout.

## 5. Knowledge base ingestion
1. Admin uploads a PDF/DOCX/TXT/Markdown file or submits a URL, or writes an
   FAQ directly.
2. `KnowledgeDocument` created with `status: pending` → background job
   extracts text → chunks it → embeds each chunk → `KnowledgeChunk`s written
   → `status: ready` (or `failed` with a surfaced error, e.g. unreadable PDF).
3. Document is immediately usable by the AI once `ready`; re-uploading a
   source replaces its chunks atomically (old chunks deleted after new ones
   are written, not before, so the AI never sees a knowledge gap mid-update).

## 6. AI insight surfacing
1. A nightly job aggregates the day's conversations into an `Analytics`
   rollup: resolution rate, takeover rate, sentiment, common questions,
   knowledge gaps (clusters of low-confidence/fallback answers).
2. Dashboard **Analytics** page renders trends and a plain-language insight
   feed, e.g. "Customers asked about shipping 243 times this week —
   consider adding a shipping FAQ," linking directly to "create FAQ".

## 7. Escalation to a Ticket
1. From a conversation, an agent (or the AI, for detected complaints) can
   "Create ticket" — captures the issue with priority/category, independent
   of the chat thread's lifecycle (e.g. a refund that takes days to resolve).
2. Ticket status is tracked separately in **Tickets**; resolving it does not
   require reopening the original conversation.
