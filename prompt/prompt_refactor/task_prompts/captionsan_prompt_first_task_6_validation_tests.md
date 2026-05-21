# CaptionSan — Task 6: Validation and Tests

## Goal
Verify the prompt-first refactor works end-to-end and does not break existing behavior.

## Scope
- Ensure prompt generation cannot be skipped.
- Ensure content cannot be generated before prompt approval.
- Ensure histories are saved.
- Ensure platform output behavior still works.
- Ensure schema, UI, and backend changes work together.

## Requirements
- Write or update tests where practical.
- Validate both happy path and blocked path.
- Verify prompt and content states.
- Verify copy and approval still work.

## Suggested steps
1. Review the prompt-first flow.
2. Add tests for approval gating.
3. Add tests for prompt generation.
4. Add tests for content generation after approval.
5. Run validation on schema and UI integration.

## Acceptance criteria
- Prompt cannot be skipped.
- Content cannot generate before prompt approval.
- Histories are stored correctly.
- Platform outputs still behave correctly.
- Major user flow is validated.

## Output expected
- Summary of changes.
- Files changed.
- Test notes.
- Any blockers or follow-up.
