# CaptionSan — Milestone 2 Prompt

You are working in the CaptionSan repo.

## Goal
Implement provider setup so users can save and validate their own OpenAI-compatible AI provider connections.

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

## Milestone 2 scope
1. Create provider connection model.
2. Add UI for saving OpenAI-compatible provider credentials.
3. Add encryption handling for API keys.
4. Add provider health check or test connection flow.

## Requirements
- Keep provider logic abstracted and reusable.
- Store secrets securely.
- Support one default provider per user if needed.
- Keep the UI simple and invite-only friendly.
- Do not implement AI generation yet.

## Constraints
- Do not hardcode model-specific logic.
- Do not couple provider config to project content records.
- Keep the connection flow testable.
- Preserve future multi-provider support.

## Suggested implementation order
1. Inspect existing schema and auth flow.
2. Add or refine provider connection schema.
3. Add API endpoints for CRUD and test connection.
4. Add UI for provider settings.
5. Add secure API key handling.
6. Validate connection and save state.

## Expected output
When done, return:
- Summary of changes.
- Files changed.
- Security notes for API key handling.
- Any blockers or assumptions.
