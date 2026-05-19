# CaptionSan — Milestone 6 Prompt

You are working in the CaptionSan repo.

## Goal
Implement the revision loop so users can manually edit outputs and request AI revisions using free-text instructions until approved.

## Product context
- Product name: CaptionSan.
- UI language: Indonesian default, English optional.
- Auth: invite-only/internal first.
- AI: BYOK.
- Provider support: OpenAI-compatible first.
- Frontend: modern Next.js.
- Backend API: Hono.
- Database: PostgreSQL.
- ORM: Drizzle.
- Auth system: Better Auth.

## Milestone 6 scope
1. Add manual edit capability.
2. Add free-text revision form.
3. Send revision instruction to AI.
4. Save revision history.
5. Update approval state.

## Requirements
- Preserve the current AI output before revision.
- Allow multiple revision rounds.
- Keep manual edits separate from AI revisions when possible.
- Make approval explicit.

## Constraints
- Do not lose history across revisions.
- Do not auto-approve anything.
- Keep revision logic separate from generation logic.
- Keep content versioning intact.

## Suggested implementation order
1. Inspect output data model.
2. Add revision history schema if needed.
3. Add edit UI and revision instruction UI.
4. Wire revision API.
5. Update version state after each revision.
6. Add approval action.
7. Validate history and state transitions.

## Expected output
When done, return:
- Summary of changes.
- Files changed.
- Revision history behavior.
- Any blockers or assumptions.
