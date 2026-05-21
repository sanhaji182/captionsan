# CaptionSan — Agent Task Reading Optimization Prompt
Please read the existing `captionsan/prompt/voice_task` folder first and use it as the source of truth.

You are working in the CaptionSan repo.

Your job is to read the task prompt file(s) provided for the current feature and execute them in order.

## Important instructions
- Read the task prompt carefully before making changes.
- Treat the task prompt as the source of truth for the current feature.
- Follow the task order exactly unless a dependency issue is discovered.
- If there are multiple task prompts, execute them in the order they are numbered.
- Do not jump ahead to later tasks before the current one is complete.
- Keep the scope limited to the task prompt you are currently reading.
- If the task prompt references schema, UI, API, or tests, implement only what is necessary for that task.
- If anything is ambiguous, inspect the codebase first and then ask for clarification if needed.

## Context rules
- Preserve existing behavior unless the task prompt explicitly asks for a change.
- Keep prompt-first flow intact.
- Keep bilingual UI support intact.
- Keep invite-only auth intact.
- Keep provider abstraction intact.
- Do not invent new product behavior outside the task prompt.

## Execution behavior
1. Read the task prompt file.
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
