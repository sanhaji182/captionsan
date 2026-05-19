# CaptionSan — Task 1: Schema and Data Access

## Goal
Add or migrate the data model so the app can store prompt drafts, prompt revisions, prompt approvals, and link content generation to an approved prompt.

## Scope
- Add prompt draft storage.
- Add prompt revision storage.
- Link generation jobs to approved prompts.
- Keep content revision storage intact.
- Update types, migrations, and data access together.

## Requirements
- Preserve original project input.
- Preserve prompt history.
- Preserve content history.
- Do not break existing content revision behavior.
- Keep the schema multiuser-ready.

## Suggested steps
1. Inspect current schema and data access layer.
2. Add or refine prompt draft tables/fields.
3. Add or refine prompt revision tables/fields.
4. Ensure generation jobs reference approved prompts.
5. Update types and migration files.
6. Verify queries and inserts still work.

## Acceptance criteria
- Prompt drafts are stored separately from content.
- Prompt revisions are stored separately.
- Generation can reference an approved prompt.
- Existing content revision data still works.
- Schema changes are reflected in code and migrations.

## Output expected
- Summary of changes.
- Files changed.
- Migration notes.
- Any assumptions or blockers.
