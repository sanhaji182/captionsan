# CaptionSan — Task 4: Content Generation Pipeline

## Goal
Generate platform-specific content only after the prompt has been approved.

## Scope
- Trigger content generation after prompt approval.
- Generate output per selected platform.
- Preserve platform formatting rules.
- Store content separately from the prompt.

## Requirements
- Content generation must depend on approved prompt only.
- Platform outputs must remain distinct.
- Thread numbering must still work.
- Existing tone and length logic must still apply.

## Suggested steps
1. Inspect content generation entry points.
2. Add approval gate before generation.
3. Pass approved prompt into content generation.
4. Save generated outputs.
5. Keep platform formatting unchanged where possible.

## Acceptance criteria
- Content does not generate before prompt approval.
- Approved prompt is used as the content input.
- Platform-specific outputs are still produced.
- Content records are stored correctly.

## Output expected
- Summary of changes.
- Files changed.
- Content-generation notes.
- Any blockers or assumptions.
