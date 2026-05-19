# CaptionSan Agent Instructions

## Dual-Structure Context
This project uses two documentation structures for maximum compatibility with different AI agents:

1. **Standard Structure (`docs/`)**: Used by general agents and manual reference.
2. **Kiro Structure (`.kiro/`)**: Used for specialized Kiro steering and specifications.

Both structures contain the same core information. When updating requirements or tasks, please update both locations if possible.

## Project overview
CaptionSan is a bilingual invite-only SaaS for AI-assisted content writing. The app turns one main idea or rough draft into platform-specific outputs for Instagram Feed, Instagram Story, Threads, WhatsApp Status, LinkedIn, and Website.

## Product rules
- Indonesian is the default UI language.
- English is optional and must remain supported.
- The product is invite-only/internal first.
- AI usage is BYOK.
- OpenAI-compatible providers are supported first.
- Threads output must always be numbered.
- Revision flow must use free-text instructions.
- Original input and revision history must always be preserved.
- Manual edit and approval must remain available.

## Folder Mapping
- `docs/PRD.md` ↔ `.kiro/specs/captionsan-core/requirements.md`
- `docs/schema/` ↔ `.kiro/specs/captionsan-core/design.md`
- `docs/roadmap/` ↔ `.kiro/specs/captionsan-core/tasks.md`
- `docs/rules/` ↔ `.kiro/steering/rules.md`
- `docs/prompts/` ↔ `.kiro/prompts/`

## Stack
- Frontend: Next.js.
- Backend API: Hono.
- Database: PostgreSQL.
- ORM: Drizzle.
- Auth: Better Auth.
- AI: Provider-agnostic, OpenAI-compatible first.

## Working rules
- Inspect the codebase before making changes.
- Prefer small, incremental changes.
- Do not hardcode provider logic in multiple places.
- Keep AI provider code abstracted.
- Keep generation, revision, and approval logic separated.
- Preserve existing conventions unless they are clearly wrong.

## Build order
1. Foundation.
2. Provider setup.
3. Project creation.
4. AI generation core.
5. Platform formatting.
6. Revision loop.
7. Review and copy UX.
8. API readiness.
