# CaptionSan — Milestone 3 Prompt

You are working in the CaptionSan repo.

## Goal
Implement project creation so users can store a content brief, rough draft, and supporting context as the basis for AI generation.

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

## Milestone 3 scope
1. Add project model.
2. Add create project UI.
3. Store original input and additional context.
4. Add project list or history view.

## Requirements
- Support both idea input and rough draft input.
- Preserve original user input exactly.
- Keep project records ready for generation jobs later.
- Keep the UI simple and clear.

## Constraints
- Do not implement AI generation yet.
- Do not mix project data with provider config.
- Keep content history stable and queryable.
- Keep bilingual UI labels ready.

## Suggested implementation order
1. Inspect current data model.
2. Add project schema and migrations.
3. Add create/read project endpoints.
4. Build the project creation UI.
5. Add list/history view.
6. Validate data persistence.

## Expected output
When done, return:
- Summary of changes.
- Files changed.
- Data model updates.
- Any blockers or assumptions.
