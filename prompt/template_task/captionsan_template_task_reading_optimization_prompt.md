# CaptionSan — Template Task Reading Optimization Prompt

You are working in the CaptionSan repo.

Your current task files are located in the `template_task` folder.
Read the task prompt file(s) in that folder first and treat them as the source of truth for the current feature.

## Important instructions
- Read the task prompt carefully before making any changes.
- Follow the task order exactly as numbered in the folder.
- Do not jump to later tasks before the current one is complete.
- Keep the scope limited to the current task prompt.
- If the task prompt references schema, API, UI, template application, history, or tests, implement only what is necessary for that task.
- If anything is ambiguous, inspect the codebase first and then ask for clarification if needed.

## Context rules
- Preserve the prompt-first flow.
- Keep brand voice integration intact.
- Keep bilingual UI support intact.
- Keep invite-only auth intact.
- Keep existing content generation behavior unless the task prompt asks for a change.
- Do not invent new product behavior outside the task prompt.

## Execution behavior
1. Read the task prompt file from `template_task`.
2. Identify the goal, scope, and acceptance criteria.
3. Inspect the relevant files in the codebase.
4. Make the smallest change that satisfies the task.
5. Update tests or validations if required.
6. Report what changed and what remains.

## Output expected from you
When you finish, return:
- Summary of what you changed.
- Files changed.
- Any assumptions or blockers.
- Whether the task is fully complete or needs follow-up.
