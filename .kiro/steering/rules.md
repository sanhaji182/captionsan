# CaptionSan Rules

## Dual-Structure Context
This project maintains compatibility with multiple agent types by mirroring documentation in `docs/` and `.kiro/`.

## Working rules
- Inspect the codebase before making changes.
- Prefer small, incremental changes.
- Do not hardcode provider logic in multiple places.
- Keep AI provider code abstracted.
- Keep generation, revision, and approval logic separated.
- Preserve existing conventions unless they are clearly wrong.
- Ask before making assumptions if required files or patterns are missing.

## Testing and validation
- Add tests when business logic changes.
- Verify schema and migration changes together.
- Verify invite-only access behavior.
- Verify provider settings do not expose secrets.
- Verify generated outputs per platform.
- Verify thread numbering.
- Verify revision history is saved.
- Verify copy actions still work.
