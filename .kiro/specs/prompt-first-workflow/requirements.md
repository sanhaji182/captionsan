# CaptionSan PRD v2 — Prompt-First Workflow

## Product summary
CaptionSan is a bilingual invite-only SaaS for AI-assisted content writing. It helps users turn one rough idea or draft into a reviewable prompt first, then uses the approved prompt to generate platform-specific content for Instagram Feed, Instagram Story, Threads, WhatsApp Status, LinkedIn, and Website.

## Problem statement
Users who create content for multiple platforms need more control over the AI process than a direct draft-to-content flow provides. If the prompt is weak, the content becomes inconsistent and harder to revise. CaptionSan solves this by introducing a prompt-first workflow where AI first creates a strong prompt draft, the user reviews and approves it, and only then does AI generate the final content.

## What changes from v1
The current implementation generates content directly from the user's input. This refactor introduces an intermediate prompt layer:
- The first AI output is a prompt draft, not content.
- The user must review and approve the prompt before content generation.
- Content generation only happens after prompt approval.
- Prompt history and content history are stored separately.

## Product principles
- Indonesian is the default UI language.
- English must be supported.
- Access is invite-only/internal first.
- AI uses BYOK.
- OpenAI-compatible providers are supported first.
- The user stays in control of the final output.
- Original input, prompt history, and content history must be preserved.

## Core workflow (prompt-first)
1. User receives an invite and signs in.
2. User saves their own AI provider configuration.
3. User creates a project from a rough idea or draft.
4. AI generates a prompt draft from the input.
5. User reviews, edits, and approves the prompt.
6. AI generates platform-specific content using the approved prompt.
7. User reviews, edits, and revises the content.
8. User approves the final content.
9. User copies the output or uses the API later.

## Supported platforms
- Instagram Feed.
- Instagram Story.
- Threads.
- WhatsApp Status.
- LinkedIn.
- Website.

## Prompt layer behavior
- The first AI result must be a prompt draft, not final content.
- The prompt should reinterpret the user's idea or draft into a strong writing instruction ready for content generation.
- The user must be able to edit this prompt manually before approving it.
- The user may request prompt revision using free-text instructions.
- Prompt revision history must be stored.
- Prompt approval must be explicit.
- Content generation must be blocked until prompt approval.

## Content layer behavior
- After the prompt is approved, the system uses that prompt to generate platform-specific content.
- Each platform may have different tone, length, and structure rules.
- Threads must be numbered.
- LinkedIn should be professional.
- Website content may be long-form.
- Content revision uses free-text instructions.
- Content approval must be explicit.
- Content revision history must be stored separately from prompt revision history.

## Platform behavior
### Instagram Feed
- Engaging caption.
- Strong hook.
- Readable paragraphs.
- Optional CTA and hashtags.

### Instagram Story
- Short caption.
- Main point only.
- Minimal text.

### Threads
- Split into numbered parts.
- Conversational and easy to scan.

### WhatsApp Status
- Very short.
- Natural and personal tone.

### LinkedIn
- Professional.
- Insight-driven.
- Paragraph-based.
- Clear CTA or discussion prompt.

### Website
- Full text.
- SEO-friendly.
- Can act as intro text or long-form rewrite.

## MVP scope
### Must have
- Invite-only authentication.
- User and invitation management.
- BYOK provider configuration.
- OpenAI-compatible provider support first.
- Project creation.
- Main idea and rough draft input.
- Prompt generation from input.
- Prompt review and approval flow.
- Prompt revision with free-text instructions.
- Multi-platform content generation from approved prompt only.
- Tone per platform.
- Character-aware output.
- Thread numbering.
- Manual edit flow for both prompt and content.
- Content revision loop.
- Revision history for prompt and content (stored separately).
- Explicit approval state for prompt and content.
- Copy per platform.
- Bilingual UI with Indonesian default.

### Nice to have
- Prompt diff view.
- Content diff view.
- Prompt presets per platform.
- Saved style profiles.
- API token for future pipeline access.

### Out of scope for MVP
- Auto-posting.
- Public signup.
- Analytics dashboard.
- Complex billing.
- Social inbox.
- Full brand asset management.

## System requirements
- Store original input unchanged.
- Store generated prompt separately from generated content.
- Store current prompt and approved prompt separately.
- Store current AI content separately from the original AI content.
- Store every revision event for both prompt and content.
- Support multiple providers later without redesigning the core model.
- Keep provider configuration separate from content records.
- Keep the app ready for future API consumption.

## Data model overview
- User.
- Invitation.
- AI provider connection.
- Project.
- Prompt draft (original, current, approval state).
- Prompt revision message.
- Generation job (linked to approved prompt).
- Platform output.
- Content revision message.
- Content approval state.

## API overview
- Invite user.
- Accept invite.
- Save provider config.
- Create project.
- Generate prompt.
- Revise prompt.
- Approve prompt.
- Generate content (requires approved prompt).
- Revise content.
- Approve content.
- Fetch project history.

## Acceptance criteria
- Invite-only access works.
- User can save a BYOK provider config.
- User can generate a prompt draft from a main idea or draft.
- User can edit and approve the prompt before content generation.
- Content generation only happens after prompt approval.
- Each selected platform receives a different style output.
- Tone can differ by platform.
- Threads are numbered automatically.
- User can revise prompt and content using free text.
- User can edit prompt and content manually.
- User can approve the final output.
- User can copy the final output.
- Prompt history and content history are stored separately.
- UI is bilingual with Indonesian default.

## Non-goals
- No auto-posting.
- No public onboarding in MVP.
- No advanced analytics.
- No complex team billing in the first version.

## Implementation notes for AI agent
- Build foundation first.
- Add prompt generation as a separate pipeline from content generation.
- Keep prompt logic isolated.
- Keep content generation logic isolated.
- Gate content generation behind prompt approval.
- Make platform formatting deterministic and testable.
- Prefer reusable configuration over hardcoded branching.
- Preserve prompt history, content history, and approval state.
- Do not rewrite unrelated parts of the app.
- Keep changes small and incremental.
- Reuse existing components and state if possible.
