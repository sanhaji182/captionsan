# Task 1 — Scope and Callback Flow

Create the CaptionSan-side scope for the n8n review callback integration.

Requirements:
- Define the review callback flow between n8n and CaptionSan.
- Keep CaptionSan as the source of truth for review status.
- Support draft, in_review, approved, rejected, and revision_requested states.
- Preserve the prompt-first workflow, bilingual UI, and invite-only access.

Acceptance criteria:
- The callback flow is explicit and limited.
- Review states are clearly defined.
- No unrelated automation features are included.
