# CaptionSan — Task 3: Prompt Review and Approval UI

## Goal
Add UI for reviewing, editing, revising, and approving the generated prompt before any content is produced.

## Scope
- Show the generated prompt to the user.
- Allow manual edits to the prompt.
- Allow free-text revision instructions for the prompt.
- Add an explicit approve prompt action.
- Prevent content generation until approval.

## Requirements
- Prompt must be clearly visible.
- User must be able to edit prompt text directly.
- User must be able to ask AI to revise the prompt.
- Prompt approval must be explicit.
- Content generation must remain blocked until prompt approval.

## Suggested steps
1. Inspect current UI flow.
2. Add prompt review step.
3. Add prompt edit controls.
4. Add prompt revision input.
5. Add approve prompt action.
6. Gate the next step behind approval state.

## Acceptance criteria
- User can see the generated prompt.
- User can edit the prompt.
- User can revise the prompt with free text.
- User can approve the prompt.
- Content generation remains blocked until approval.

## Output expected
- Summary of changes.
- Files changed.
- UI state notes.
- Any blockers or assumptions.
