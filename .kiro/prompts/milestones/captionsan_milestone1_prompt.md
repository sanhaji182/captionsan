# CaptionSan — Milestone 1 Prompt

You are working in the CaptionSan repo.

## Goal
Implement the foundation layer for an invite-only bilingual SaaS that generates AI-assisted captions and long-form content.

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

## Files you should inspect first
- Existing app structure.
- Environment config files.
- Database setup.
- Auth setup.
- Any current UI shell.

## Milestone 1 scope
1. Initialize or verify repo structure.
2. Add environment variable configuration.
3. Set up PostgreSQL connection and Drizzle migration flow.
4. Add Better Auth baseline.
5. Add invite-only access guard.

## Requirements
- Keep the implementation minimal and clean.
- Do not build generation features yet.
- Do not add provider UI yet.
- Keep all auth-related logic compatible with invite-only flow.
- Preserve bilingual readiness.
- Keep code organized for later SaaS expansion.

## Constraints
- Do not hardcode AI logic.
- Do not introduce unnecessary abstractions.
- Update schema, types, and migrations together when needed.
- Use existing project conventions if present.
- Ask before making assumptions if a required file or pattern is missing.

## Suggested implementation order
1. Inspect current repo layout.
2. Add or update env variables.
3. Wire PostgreSQL and Drizzle.
4. Define initial tables from schema.
5. Integrate Better Auth baseline.
6. Add invite-only gate for app access.
7. Validate the app still runs.

## Expected output
When done, return:
- Summary of what you changed.
- Files changed.
- Any migration or env updates.
- Any blockers or assumptions.
