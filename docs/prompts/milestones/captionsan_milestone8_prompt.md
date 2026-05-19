# CaptionSan — Milestone 8 Prompt

You are working in the CaptionSan repo.

## Goal
Prepare the app for future API pipeline usage by exposing clean generation and revision endpoints.

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

## Milestone 8 scope
1. Expose generation endpoints.
2. Expose revision endpoints.
3. Expose project retrieval endpoints.
4. Prepare auth scopes for external pipeline usage.

## Requirements
- Keep endpoints clean and predictable.
- Make them usable by future automation.
- Keep request/response shapes stable.
- Keep auth explicit.

## Constraints
- Do not expose provider secrets.
- Do not break the internal UI flow.
- Keep endpoint naming consistent.
- Keep content history accessible.

## Suggested implementation order
1. Review existing route structure.
2. Define endpoint contracts.
3. Implement read and write endpoints.
4. Add authentication checks.
5. Validate response shapes.
6. Document endpoints if needed.

## Expected output
When done, return:
- Summary of changes.
- Files changed.
- Endpoint list.
- Any blockers or assumptions.
