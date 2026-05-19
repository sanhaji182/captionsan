# CaptionSan — Full Start Prompt

You are the coding agent for CaptionSan.

## Objective
Build CaptionSan from a clean starting point in the correct order so the app becomes a working invite-only bilingual SaaS with AI-assisted content writing.

## Product summary
- CaptionSan is a bilingual SaaS.
- Indonesian is the default UI language.
- English is optional.
- Access is invite-only/internal first.
- AI uses BYOK.
- Providers are OpenAI-compatible first.
- The frontend should be modern and fast.
- The backend API should be lightweight and scalable.
- The database is PostgreSQL.
- ORM is Drizzle.
- Auth is Better Auth.

## Business goal
Turn one rough idea or draft into platform-specific content outputs that are ready to copy, edit, and approve.

## Core workflow
1. User gets invited.
2. User signs in.
3. User saves their provider config.
4. User creates a project from an idea or draft.
5. User selects target platforms.
6. System generates platform-specific outputs.
7. User reviews, edits, and revises outputs.
8. User approves final content.
9. User copies output or uses API later.

## Target platforms
- Instagram Feed.
- Instagram Story.
- Threads.
- WhatsApp Status.
- LinkedIn.
- Website.

## Required product behavior
- Different tone per platform.
- Character-aware formatting.
- Threads output must be numbered.
- Website output can be full text.
- Revision loop must accept free-text instructions.
- Manual edits must be possible.
- Original input must always be preserved.
- Revision history must be saved.
- Approval must be explicit.

## Build order
### Phase 1: Foundation
- Set up repo structure.
- Set up env config.
- Set up PostgreSQL and Drizzle.
- Set up Better Auth.
- Add invite-only gate.

### Phase 2: Provider setup
- Create provider connection schema.
- Add provider settings UI.
- Add secure API key storage.
- Add provider test connection.

### Phase 3: Project system
- Create project schema.
- Add project creation UI.
- Save idea/draft/context.
- Add project history view.

### Phase 4: AI generation
- Create AI service abstraction.
- Build prompt builder.
- Generate outputs per platform.
- Store generation jobs and outputs.

### Phase 5: Platform formatting
- Add platform tone mapping.
- Add output length logic.
- Add thread numbering.
- Keep formatting isolated and testable.

### Phase 6: Revision loop
- Add manual edit flow.
- Add revision instruction form.
- Save revision history.
- Add approval state.

### Phase 7: UX and copy
- Add compare view.
- Add copy per output.
- Add copy all.
- Make review status visible.

### Phase 8: API readiness
- Add stable generation endpoints.
- Add revision endpoints.
- Add project retrieval endpoints.
- Prepare auth for future pipeline use.

## Technical constraints
- Keep provider logic abstracted.
- Do not hardcode model-specific behavior in business code.
- Keep content versioned.
- Keep data model multiuser-ready.
- Keep UI bilingual and Indonesia-first.
- Keep changes incremental and testable.

## Code quality rules
- Inspect before editing.
- Prefer minimal changes.
- Preserve existing conventions.
- Add tests when logic changes.
- Avoid unnecessary abstractions.
- Ask before guessing if a required pattern is missing.

## Expected output from you
For every task, return:
- Summary of what you changed.
- Files changed.
- Any migrations or env updates.
- Any assumptions.
- Any blockers or follow-up.
