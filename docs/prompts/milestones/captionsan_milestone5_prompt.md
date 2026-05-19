# CaptionSan — Milestone 5 Prompt

You are working in the CaptionSan repo.

## Goal
Implement platform-specific formatting so each output follows the correct style, tone, and length constraints.

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

## Milestone 5 scope
1. Add platform-specific output rules.
2. Add tone selection per platform.
3. Add character-aware formatting.
4. Add thread numbering logic.

## Platform rules
- Instagram Feed: hook, readable paragraphs, CTA, optional hashtags.
- Instagram Story: short, main point only.
- Threads: numbered parts.
- WhatsApp Status: short and natural.
- LinkedIn: professional and insight-driven.
- Website: full text and SEO-friendly.

## Requirements
- Keep the same core topic across platforms.
- Allow different tone per platform.
- Respect platform length constraints.
- Make Threads split deterministic and readable.

## Constraints
- Do not change project structure unless needed.
- Do not break generation storage.
- Keep formatting logic isolated and testable.

## Suggested implementation order
1. Inspect current generation output structure.
2. Add platform formatter module.
3. Add tone mapping per platform.
4. Add character-length logic.
5. Add thread split and numbering logic.
6. Update UI display if needed.
7. Validate examples for every platform.

## Expected output
When done, return:
- Summary of changes.
- Files changed.
- Platform formatting rules added.
- Any blockers or assumptions.
