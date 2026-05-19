# CaptionSan — AI Build Checklist

## Before coding
- PRD read and confirmed.
- Scope of current task defined.
- Related files identified.
- Acceptance criteria written.
- Non-goals stated.

## During coding
- Make small incremental changes.
- Keep generation logic isolated.
- Keep auth and provider logic abstracted.
- Update types/schema together.
- Add tests for business logic.

## Before merge
- Run lint.
- Run tests.
- Verify invite-only flow.
- Verify BYOK connection flow.
- Verify generation output per platform.
- Verify revision loop.
- Verify copy behavior.
- Verify bilingual UI labels.
