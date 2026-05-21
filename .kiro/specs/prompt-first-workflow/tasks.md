# CaptionSan — Prompt-First Refactor Tasks

## Task 1: Schema and Data Access

### Goal
Add the prompt layer to the data model so the app can store prompt drafts, prompt revisions, prompt approvals, and link content generation to an approved prompt.

### Steps
1. Add `prompt_drafts` table to `packages/db/src/schema/`.
2. Add `prompt_revisions` table to `packages/db/src/schema/`.
3. Add `prompt_draft_id` foreign key to `generations` table.
4. Rename `revision_messages` to `content_revisions` (or create new table and deprecate old).
5. Export new tables from `packages/db/src/schema/index.ts`.
6. Create Drizzle migration for the new/modified tables.
7. Update TypeScript types if needed.

### Acceptance criteria
- `prompt_drafts` table exists with columns: id, project_id, prompt_original, prompt_current, prompt_approved, prompt_status, created_at, updated_at.
- `prompt_revisions` table exists with columns: id, prompt_draft_id, actor_type, instruction_text, resulting_prompt, created_at.
- `generations` table has a nullable `prompt_draft_id` column referencing `prompt_drafts.id`.
- `content_revisions` table exists (same structure as current `revision_messages`).
- Migration runs without errors.
- Existing data is not lost.

---

## Task 2: Prompt Generation Pipeline

### Goal
Create a dedicated prompt generation step so the first AI output is a prompt draft, not content.

### Steps
1. Create a prompt generation function in `apps/api/src/lib/ai/` (e.g., `prompt-generator.ts`).
2. Build a system prompt that instructs the AI to reinterpret the user's input into a strong writing instruction.
3. Call the existing provider abstraction to generate the prompt.
4. Store the result in `prompt_drafts` (both `prompt_original` and `prompt_current`).
5. Update project status to `prompt_review`.
6. Add API route: `POST /api/projects/:projectId/prompt/generate`.
7. Ensure content generation is NOT triggered in this step.

### Acceptance criteria
- Submitting an idea/draft creates a prompt draft record.
- The prompt is stored in `prompt_drafts` with `prompt_approved = false`.
- Content generation does not happen in this step.
- The prompt output is returned to the caller for UI display.
- The existing provider abstraction is reused.

---

## Task 3: Prompt Review and Approval API

### Goal
Add API endpoints for editing, revising, and approving the generated prompt.

### Steps
1. Add route: `PUT /api/projects/:projectId/prompt/edit` — saves manual prompt edits to `prompt_current`.
2. Add route: `POST /api/projects/:projectId/prompt/revise` — sends revision instruction to AI, stores result in `prompt_revisions`, updates `prompt_current`.
3. Add route: `POST /api/projects/:projectId/prompt/approve` — sets `prompt_approved = true` and `prompt_status = 'approved'`.
4. Add validation: reject content generation if prompt is not approved.
5. Add validation: reject prompt revision if prompt is already approved (optional: allow un-approve).

### Acceptance criteria
- User can save manual edits to the prompt.
- User can request AI revision of the prompt with free-text instructions.
- Each revision is stored in `prompt_revisions`.
- User can approve the prompt explicitly.
- Content generation returns 400 if prompt is not approved.

---

## Task 4: Prompt Review UI

### Goal
Add UI for reviewing, editing, revising, and approving the generated prompt before any content is produced.

### Steps
1. Add a prompt review step/section in the project detail page (`apps/web/src/app/projects/[id]/page.tsx`).
2. Show the generated prompt text with an editable textarea.
3. Add a revision input field for free-text instructions.
4. Add a "Revise Prompt" button that calls the revision API.
5. Add an "Approve Prompt" button that calls the approval API.
6. Show prompt revision history.
7. Disable/hide content generation controls until prompt is approved.
8. Keep UI bilingual (Indonesian default).

### Acceptance criteria
- User can see the generated prompt after project creation.
- User can edit the prompt text directly.
- User can revise the prompt with free-text instructions.
- User can approve the prompt.
- Content generation controls are hidden/disabled until prompt approval.
- Prompt revision history is visible.

---

## Task 5: Content Generation Pipeline (Gated)

### Goal
Modify content generation to only proceed after prompt approval, using the approved prompt as input.

### Steps
1. Update the content generation entry point to check `prompt_approved = true`.
2. Return 400 error if prompt is not approved.
3. Pass `prompt_current` from the approved prompt draft as the input to content generation.
4. Link the `generations` record to the `prompt_draft_id`.
5. Keep platform-specific formatting rules unchanged.
6. Keep thread numbering logic unchanged.
7. Update route: `POST /api/projects/:projectId/content/generate` (or modify existing generation route).

### Acceptance criteria
- Content does not generate before prompt approval.
- Approved prompt text is used as the content generation input.
- Platform-specific outputs are still produced correctly.
- Thread numbering still works.
- Generation record references the prompt draft.

---

## Task 6: Content Review UI (Reconnect)

### Goal
Ensure the existing content review, edit, revision, and approval flow works correctly after the prompt-first refactor.

### Steps
1. Verify content review UI still renders after content generation.
2. Verify manual content edits still save correctly.
3. Verify free-text content revision still works.
4. Verify content revision history is displayed.
5. Verify content approval still works.
6. Verify copy actions still work.
7. Update any API calls that changed paths or parameters.

### Acceptance criteria
- Content can be edited manually.
- Content can be revised with free-text instructions.
- Content revision history is preserved and visible.
- Content approval still works.
- Copy actions still work.
- Content review is clearly separate from prompt review in the UI.

---

## Task 7: Validation and End-to-End Testing

### Goal
Verify the prompt-first refactor works end-to-end and does not break existing behavior.

### Steps
1. Test happy path: create project → generate prompt → approve prompt → generate content → approve content → copy.
2. Test blocked path: attempt content generation before prompt approval (must fail).
3. Test prompt revision: generate prompt → revise → verify history → approve.
4. Test content revision: generate content → revise → verify history → approve.
5. Verify prompt and content histories are stored separately.
6. Verify platform outputs still have correct formatting.
7. Verify thread numbering.
8. Verify bilingual UI labels.
9. Add automated tests where practical (API route tests, pipeline unit tests).

### Acceptance criteria
- Prompt cannot be skipped.
- Content cannot generate before prompt approval.
- Prompt revision history is stored correctly.
- Content revision history is stored correctly.
- Platform outputs behave correctly.
- Thread numbering works.
- Copy actions work.
- No regressions in existing functionality.

---

## Implementation Order

```
Task 1 (Schema) → Task 2 (Prompt Pipeline) → Task 3 (Prompt API) → Task 4 (Prompt UI)
                                                                          ↓
                                              Task 5 (Content Pipeline) → Task 6 (Content UI) → Task 7 (Validation)
```

Tasks 1–4 must be completed sequentially. Task 5 depends on Tasks 1–3. Task 6 depends on Task 5. Task 7 runs last.
