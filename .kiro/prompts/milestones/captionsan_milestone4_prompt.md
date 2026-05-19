# CaptionSan — Milestone 4 Prompt

You are working in the CaptionSan repo.

## Goal
Implement the core AI generation pipeline that turns one project input into multiple platform-specific outputs.

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

## Milestone 4 scope
1. Build AI service abstraction.
2. Build prompt assembly from input and platform rules.
3. Generate outputs per selected platform.
4. Store generation job and platform outputs.

## Requirements
- Support main idea and rough draft input.
- Generate one or more platform outputs from the same source.
- Keep the AI layer provider-agnostic.
- Store original AI output and current output separately.
- Keep generation records versioned.

## Constraints
- Do not expose provider secrets.
- Do not hardcode provider-specific logic in business code.
- Keep prompts deterministic enough to test.
- Preserve the original user input.

## Suggested implementation order
1. Inspect provider connection data.
2. Define generation job schema if needed.
3. Implement AI service abstraction.
4. Implement prompt builder.
5. Generate outputs by selected platform.
6. Save generation and output records.
7. Add basic tests or validation.

## Expected output
When done, return:
- Summary of changes.
- Files changed.
- Prompting or generation assumptions.
- Any blockers or assumptions.
