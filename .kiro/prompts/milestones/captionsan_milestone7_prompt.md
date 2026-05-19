# CaptionSan — Milestone 7 Prompt

You are working in the CaptionSan repo.

## Goal
Implement the UX layer for comparing outputs, approving content, and copying final text per platform or all at once.

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

## Milestone 7 scope
1. Add compare view for original vs current output.
2. Add approve action.
3. Add copy per platform.
4. Add copy all action.

## Requirements
- Make it easy to review the AI result.
- Make approval status visible.
- Make copying fast and reliable.
- Keep the layout clean for multi-platform content.

## Constraints
- Do not alter core generation logic.
- Do not clutter the UI with unnecessary controls.
- Keep all actions clearly scoped to one platform output.

## Suggested implementation order
1. Inspect current output UI.
2. Add compare layout.
3. Add approval state indicator.
4. Add copy action per output.
5. Add copy all action.
6. Validate clipboard behavior.

## Expected output
When done, return:
- Summary of changes.
- Files changed.
- UX notes.
- Any blockers or assumptions.
