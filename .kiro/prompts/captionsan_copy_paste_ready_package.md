# CaptionSan — Copy-Paste Ready Agent Package

## 1. Use in this order
1. Master prompt.
2. PRD agent-ready.
3. Repo rules.
4. Schema.
5. Full start prompt.
6. Milestone prompts, in order.
7. Subtask prompts, only when a milestone needs smaller chunks.

## 2. Recommended workflow
- Start by giving the agent the master prompt.
- Give the PRD next so the agent understands the product.
- Add repo rules and schema so the agent follows the expected structure.
- Use the full start prompt only when beginning from zero.
- Use milestone prompts for larger implementation phases.
- Use subtask prompts when you want very small, safe changes.
- After each task, ask the agent to report files changed, assumptions, and blockers.

## 3. Best-practice prompt stack
### Always include
- Product name: CaptionSan.
- Invite-only internal SaaS.
- Indonesian default, English optional.
- BYOK AI.
- OpenAI-compatible providers first.
- Next.js frontend.
- Hono API.
- PostgreSQL + Drizzle.
- Better Auth.

### Always enforce
- Keep provider logic abstracted.
- Preserve original input and revision history.
- Keep Threads numbered.
- Keep revision flow free-text.
- Keep everything bilingual-ready.

## 4. What to ask from the agent after each task
- What changed.
- Which files changed.
- Which migrations ran.
- Which environment variables changed.
- Which assumptions were made.
- Which blockers remain.

## 5. Execution discipline
- One prompt should do one main thing.
- If the task is too large, use a subtask prompt.
- If the agent starts drifting, reset with the full start prompt.
- If the feature touches schema, API, and UI, do it in small passes.
- Do not skip review after each step.

## 6. Recommended order for CaptionSan
### Phase A — Foundation
- Run Milestone 1 and Foundation subtasks.

### Phase B — Provider and project system
- Run Milestone 2 and Milestone 3, with their subtasks.

### Phase C — AI generation
- Run Milestone 4 and Milestone 5, with their subtasks.

### Phase D — Revision and UX
- Run Milestone 6 and Milestone 7, with their subtasks.

### Phase E — API readiness
- Run Milestone 8 and API readiness subtasks.
