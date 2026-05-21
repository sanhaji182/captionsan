# CaptionSan Design — Prompt-First Workflow

## Overview
This design extends the existing CaptionSan data model and architecture to support a prompt-first workflow. The key change is introducing a `prompt_drafts` table and `prompt_revisions` table, and linking the `generations` table to an approved prompt draft.

## Data Model Changes

### New tables
- `prompt_drafts` — stores the AI-generated prompt, user edits, and approval state.
- `prompt_revisions` — stores revision history for prompt drafts (free-text instructions and resulting prompt).

### Modified tables
- `generations` — adds a `prompt_draft_id` foreign key to link content generation to an approved prompt.

### Unchanged tables
- `users` — no changes.
- `invitations` — no changes.
- `provider_connections` — no changes.
- `projects` — no changes.
- `platform_outputs` — no changes (renamed from `revisionMessages` to `contentRevisions` for clarity in the new schema).
- `content_revisions` — replaces `revision_messages` with a clearer name; same structure.

## Full Schema (Drizzle)

```typescript
import { pgTable, text, timestamp, uuid, boolean, integer } from 'drizzle-orm/pg-core';

// ─── Existing tables (unchanged) ────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('member'),
  locale: text('locale').notNull().default('id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'),
  token: text('token').notNull().unique(),
  invitedBy: uuid('invited_by').references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const providerConnections = pgTable('provider_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  providerName: text('provider_name').notNull(),
  baseUrl: text('base_url').notNull(),
  model: text('model').notNull(),
  encryptedApiKey: text('encrypted_api_key').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  sourceType: text('source_type').notNull(),
  originalInput: text('original_input').notNull(),
  additionalContext: text('additional_context'),
  sourceLanguage: text('source_language').notNull().default('id'),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── New: Prompt layer ──────────────────────────────────────────────────────

export const promptDrafts = pgTable('prompt_drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  promptOriginal: text('prompt_original').notNull(),    // AI-generated prompt (immutable)
  promptCurrent: text('prompt_current').notNull(),      // Latest version (after edits/revisions)
  promptApproved: boolean('prompt_approved').notNull().default(false),
  promptStatus: text('prompt_status').notNull().default('draft'), // draft | approved
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const promptRevisions = pgTable('prompt_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  promptDraftId: uuid('prompt_draft_id').notNull().references(() => promptDrafts.id),
  actorType: text('actor_type').notNull(),              // 'user' | 'ai'
  instructionText: text('instruction_text').notNull(),  // Free-text revision instruction
  resultingPrompt: text('resulting_prompt').notNull(),  // Prompt text after this revision
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Modified: Generation layer (now linked to approved prompt) ─────────────

export const generations = pgTable('generations', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  promptDraftId: uuid('prompt_draft_id').references(() => promptDrafts.id), // NEW: link to approved prompt
  providerConnectionId: uuid('provider_connection_id').references(() => providerConnections.id),
  promptVersion: text('prompt_version').notNull().default('v1'),
  generationStatus: text('generation_status').notNull().default('queued'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Existing: Content layer (unchanged structure) ──────────────────────────

export const platformOutputs = pgTable('platform_outputs', {
  id: uuid('id').primaryKey().defaultRandom(),
  generationId: uuid('generation_id').notNull().references(() => generations.id),
  platform: text('platform').notNull(),
  tone: text('tone').notNull(),
  targetLength: integer('target_length'),
  characterCount: integer('character_count').notNull().default(0),
  contentOriginalAi: text('content_original_ai').notNull(),
  contentCurrent: text('content_current').notNull(),
  approvalStatus: text('approval_status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const contentRevisions = pgTable('content_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  platformOutputId: uuid('platform_output_id').notNull().references(() => platformOutputs.id),
  actorType: text('actor_type').notNull(),
  instructionText: text('instruction_text').notNull(),
  resultingContent: text('resulting_content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

## State Machine

### Project status flow
```
draft → prompt_generating → prompt_review → content_generating → content_review → completed
```

### Prompt status flow
```
draft → approved
```
- `draft`: Prompt has been generated but not yet approved. User can edit or request revisions.
- `approved`: User has explicitly approved the prompt. Content generation can proceed.

### Content approval status flow
```
draft → approved
```
- `draft`: Content has been generated but not yet approved. User can edit or request revisions.
- `approved`: User has explicitly approved the content. Copy actions are available.

## API Design

### Prompt endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/projects/:projectId/prompt/generate` | Generate prompt draft from project input |
| PUT | `/api/projects/:projectId/prompt/edit` | Save manual prompt edit |
| POST | `/api/projects/:projectId/prompt/revise` | Request AI revision of prompt |
| POST | `/api/projects/:projectId/prompt/approve` | Approve the current prompt |

### Content endpoints (gated behind prompt approval)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/projects/:projectId/content/generate` | Generate content from approved prompt |
| PUT | `/api/outputs/:outputId/edit` | Save manual content edit |
| POST | `/api/outputs/:outputId/revise` | Request AI revision of content |
| POST | `/api/outputs/:outputId/approve` | Approve content output |

### Validation rules
- `POST /content/generate` must return 400 if prompt is not approved.
- `POST /prompt/revise` must return 400 if prompt is already approved (user must un-approve first or create a new draft).
- All generation endpoints require a valid provider connection.

## Architecture

### Prompt generation pipeline
```
User input (originalInput + additionalContext)
  → Prompt builder (system prompt + user input → AI call)
  → Store in prompt_drafts.prompt_original and prompt_drafts.prompt_current
  → Return to UI for review
```

### Content generation pipeline
```
Approved prompt (prompt_drafts.prompt_current where prompt_approved = true)
  → Content builder (approved prompt + platform rules → AI call per platform)
  → Store in platform_outputs.content_original_ai and platform_outputs.content_current
  → Return to UI for review
```

### Key separation
- Prompt generation and content generation are separate functions.
- Prompt generation does NOT call content generation.
- Content generation requires an approved prompt as input.
- Both pipelines use the same provider abstraction.

## UI Flow

### Step 1: Project creation
- User enters title, source type, original input, additional context.
- Project is created with status `draft`.

### Step 2: Prompt generation
- User clicks "Generate Prompt".
- System calls prompt generation pipeline.
- Project status moves to `prompt_review`.
- UI shows the generated prompt with edit and revision controls.

### Step 3: Prompt review
- User can edit the prompt text directly.
- User can enter free-text revision instructions and request AI revision.
- Each revision is stored in `prompt_revisions`.
- User clicks "Approve Prompt" to proceed.

### Step 4: Content generation
- After prompt approval, user clicks "Generate Content".
- System calls content generation pipeline with the approved prompt.
- Project status moves to `content_review`.
- UI shows platform-specific outputs.

### Step 5: Content review
- User can edit content per platform.
- User can request AI revision per platform.
- Each revision is stored in `content_revisions`.
- User clicks "Approve" per platform or "Approve All".

### Step 6: Copy
- Approved content can be copied per platform.
- Copy all action available.

## Migration Strategy
- Add `prompt_drafts` table.
- Add `prompt_revisions` table.
- Add `prompt_draft_id` column to `generations` table (nullable for backward compatibility).
- Rename `revision_messages` to `content_revisions` (or add as new table and migrate data).
- Update project `status` enum to include prompt-related states.
