# CaptionSan — Task 2: Prompt Generation Pipeline

## Goal
Create a dedicated prompt generation step so the first AI output is a prompt draft, not content.

## Scope
- Generate a prompt draft from the user’s idea or draft.
- Store the prompt as the first AI artifact.
- Keep content generation blocked at this stage.
- Use the existing provider abstraction.

## Requirements
- Prompt draft must reflect the user’s original idea.
- Prompt should be reviewable and editable.
- No content should be generated yet.
- Prompt generation should be deterministic enough to test.

## Suggested steps
1. Inspect existing generation flow.
2. Create a prompt builder or prompt generation function.
3. Save prompt draft output.
4. Ensure content generation is not called here.
5. Add tests or validation if possible.

## Acceptance criteria
- Submitting an idea/draft creates a prompt draft.
- Prompt is saved separately from content.
- Content generation does not happen in this step.
- The prompt output is available for UI review.

## Output expected
- Summary of changes.
- Files changed.
- Prompt-generation assumptions.
- Any blockers or follow-up.
