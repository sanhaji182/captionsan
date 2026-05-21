# CaptionSan — Prompt-First Refactor Task

You are working in the CaptionSan repo.

## Goal
Refactor the existing implementation so the flow becomes prompt-first instead of direct draft-to-content generation.

## Product context
- CaptionSan is a bilingual invite-only SaaS.
- Indonesian is the default UI language.
- English is supported.
- Access is invite-only/internal first.
- AI uses BYOK.
- Providers are OpenAI-compatible first.
- The user must review and approve the prompt before content generation.
- The user must review and approve the generated content before final copy.

## Current problem
The current implementation generates content directly from the user's draft or idea. This must be changed so the first AI output is a prompt draft, then content is generated only after the prompt is approved.

## Desired flow
1. User enters idea or draft.
2. AI generates prompt draft.
3. User reviews and edits prompt.
4. User approves prompt.
5. AI generates platform-specific content from the approved prompt.
6. User reviews and edits content.
7. User approves final content.

## Scope of refactor
1. Update data flow and schema usage for prompt-first behavior.
2. Split prompt generation from content generation.
3. Add or update prompt draft storage.
4. Add or update prompt revision and approval flow.
5. Keep content generation dependent on approved prompt only.
6. Update UI steps and state handling.
7. Preserve existing content revision and approval behavior.

## Requirements
- Do not allow content generation before prompt approval.
- Preserve original user input.
- Preserve prompt history.
- Preserve content history.
- Keep platform-specific formatting behavior unchanged except for the new input source.
- Keep the UI bilingual and Indonesia-first.

## Constraints
- Do not rewrite unrelated parts of the app.
- Keep changes small and incremental.
- Reuse existing components and state if possible.
- Keep provider abstraction intact.
- Add or update tests if logic changes.

## Suggested implementation order
1. Inspect the current generation pipeline.
2. Update schema or data access to support prompt drafts.
3. Implement prompt generation step.
4. Gate content generation behind prompt approval.
5. Update UI flow to show prompt review first.
6. Update content generation to consume approved prompt.
7. Verify revisions, approvals, and copy flows still work.

## Acceptance criteria
- Entering an idea or draft no longer produces content immediately.
- The first AI result is a prompt draft.
- The prompt can be edited and approved.
- Content generation only occurs after prompt approval.
- Content output is still platform-specific.
- Prompt and content histories are stored separately.
- Existing revision and approval behavior works after the refactor.

## Output expected from you
When done, return:
- Summary of what you changed.
- Files changed.
- Any schema or migration updates.
- Any assumptions or blockers.
