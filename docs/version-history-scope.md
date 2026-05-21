# Version History Dashboard — Scope Definition

## Overview

The Version History Dashboard provides a chronological view of all changes made to prompts and content within a CaptionSan project. It allows users to browse, compare, and restore previous versions.

## Scope Boundaries

### In Scope
- **Prompt version history** — track every change to a prompt draft (AI-generated, manual edits, AI revisions, template applications).
- **Content version history** — track every change to platform outputs (AI-generated, manual edits, AI revisions).
- Timeline view with version label, status, author type, and timestamp.
- Compare/diff between any two versions of the same entity.
- Restore a previous version (creates a new version, does not overwrite history).
- Bilingual UI (Indonesian default, English supported).
- Invite-only auth enforced on all history endpoints.

### Out of Scope
- Cross-project history aggregation.
- Analytics or usage statistics dashboard.
- Auto-posting or publishing history.
- Undo/redo within a single editing session (browser-level).
- History for settings changes (brand voice, provider config, templates).

## Two Separate Histories

### 1. Prompt Version History

Tracks changes to `prompt_drafts.promptCurrent` for a given project.

**Existing data sources:**
- `prompt_drafts` — stores `promptOriginal` (v1) and `promptCurrent` (latest).
- `prompt_revisions` — stores each AI revision with `instructionText` and `resultingPrompt`.

**What's missing:**
- Manual edits are not recorded as revisions (only the latest `promptCurrent` is updated in-place).
- No explicit version number or label.
- No snapshot of the full state at each point in time.

**Minimum data per version entry:**
| Field | Description |
|-------|-------------|
| `entityType` | `'prompt'` |
| `entityId` | `prompt_drafts.id` |
| `versionNumber` | Sequential integer (1, 2, 3...) |
| `versionLabel` | Human-readable label (e.g., "Original", "Revisi AI #1", "Edit Manual") |
| `status` | `'draft'` \| `'approved'` |
| `actorType` | `'ai'` \| `'user'` \| `'template'` |
| `content` | Full prompt text at this version |
| `metadata` | Optional: instruction text, template ID, etc. |
| `createdAt` | Timestamp |

### 2. Content Version History

Tracks changes to `platform_outputs.contentCurrent` for each platform output.

**Existing data sources:**
- `platform_outputs` — stores `contentOriginalAi` (v1) and `contentCurrent` (latest).
- `revision_messages` (contentRevisions) — stores each revision with `instructionText` and `resultingContent`.

**What's missing:**
- Same gaps as prompt history: manual edits not tracked, no version numbers.

**Minimum data per version entry:**
| Field | Description |
|-------|-------------|
| `entityType` | `'content'` |
| `entityId` | `platform_outputs.id` |
| `versionNumber` | Sequential integer (1, 2, 3...) |
| `versionLabel` | Human-readable label |
| `status` | `'draft'` \| `'approved'` |
| `actorType` | `'ai'` \| `'user'` |
| `content` | Full content text at this version |
| `platform` | Platform identifier (for display context) |
| `metadata` | Optional: instruction text |
| `createdAt` | Timestamp |

## Compatibility with Existing Workflow

The version history feature **does not change** the existing prompt-first workflow:

1. User creates project → enters idea/draft.
2. AI generates prompt draft → **v1 snapshot recorded**.
3. User edits prompt manually → **new snapshot recorded**.
4. User requests AI revision → **new snapshot recorded** (instruction preserved).
5. User approves prompt → **status updated on latest snapshot**.
6. AI generates content per platform → **v1 content snapshot per output**.
7. User edits/revises content → **new content snapshots recorded**.
8. User approves content → **status updated**.

## Constraints

- All history endpoints require authentication (invite-only access preserved).
- History is read-heavy; writes happen only on prompt/content changes.
- Restore creates a new version (append-only history, never destructive).
- UI labels default to Indonesian with English fallback.
- Brand voice behavior is unaffected — it influences generation but is not versioned here.

## Implementation Plan (Tasks 2–6)

1. **Task 2** — Add `version_snapshots` table to store both prompt and content history in a unified schema.
2. **Task 3** — Build API endpoints for listing history, viewing a version, and restoring.
3. **Task 4** — Add diff/compare support between two versions.
4. **Task 5** — Build the dashboard UI with timeline, detail view, and actions.
5. **Task 6** — Add validation and tests.
