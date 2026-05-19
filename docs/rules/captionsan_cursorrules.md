# CaptionSan Repo Rules

## Product
CaptionSan is a bilingual invite-only SaaS for AI-assisted content writing and platform-specific caption generation.

## Stack
- Frontend: Next.js.
- Backend API: Hono.
- Database: PostgreSQL.
- ORM: Drizzle.
- Auth: Better Auth.
- AI: BYOK with OpenAI-compatible providers first.

## Rules
- Keep UI bilingual, Indonesia default.
- Keep all provider logic abstracted.
- Do not hardcode platform behavior in multiple places.
- Preserve original input and every revision.
- Prefer small incremental changes.
- Keep folder structure consistent.
- Do not create new patterns without checking existing code first.
- If adding schema changes, update types and migrations together.
- If adding AI generation logic, keep it testable and deterministic where possible.
- All user-facing copy must support Indonesian first and English fallback.
- Threads output must always be numbered.
- Revision flow must always support free-text instructions.
