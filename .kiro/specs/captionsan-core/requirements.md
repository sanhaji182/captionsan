# CaptionSan PRD

## Product summary
CaptionSan is a bilingual invite-only SaaS for AI-assisted content writing. It turns one rough idea or draft into platform-specific content for Instagram Feed, Instagram Story, Threads, WhatsApp Status, LinkedIn, and Website.

## Problem statement
People who write content for multiple platforms spend too much time rewriting the same idea in different formats. Existing tools are often too generic or do not support a collaborative edit-and-revise flow. CaptionSan solves this by letting users write one idea, generate tailored outputs per platform, edit them manually, and ask AI to revise using free-text instructions until the content is approved.

## Target users
- Internal team members.
- Invited brand or content users.
- Marketers and creators who need multi-platform content quickly.
- Future API consumers in content pipelines.

## Product principles
- Indonesian is the default UI language.
- English must be supported.
- Access is invite-only/internal first.
- AI uses BYOK.
- OpenAI-compatible providers are supported first.
- The user stays in control of the final output.
- Original input and revision history must be preserved.

## Core workflow
1. User receives an invite and signs in.
2. User saves their own AI provider configuration.
3. User creates a project from a rough idea or draft.
4. User selects target platforms.
5. System generates platform-specific outputs.
6. User reviews, edits, and revises outputs.
7. User approves the final content.
8. User copies the output or uses the API later.

## Supported platforms
- Instagram Feed.
- Instagram Story.
- Threads.
- WhatsApp Status.
- LinkedIn.
- Website.

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
- Multi-platform generation.
- Tone per platform.
- Character-aware output.
- Thread numbering.
- Manual edit flow.
- Free-text revision loop.
- Revision history.
- Explicit approval state.
- Copy per platform.
- Bilingual UI with Indonesian default.

### Nice to have
- Output diff view.
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
- Store current AI output separately from the original AI output.
- Store every revision event.
- Support multiple providers later without redesigning the core model.
- Keep provider configuration separate from content records.
- Keep the app ready for future API consumption.

## Data model overview
- User.
- Invitation.
- AI provider connection.
- Project.
- Generation job.
- Platform output.
- Revision message.
- Approval state.

## API overview
- Invite user.
- Accept invite.
- Save provider config.
- Create project.
- Generate outputs.
- Revise output.
- Approve output.
- Fetch project history.

## Acceptance criteria
- Invite-only access works.
- User can save a BYOK provider config.
- User can generate outputs from a main idea or draft.
- Each selected platform receives a different style output.
- Tone can differ by platform.
- Threads are numbered automatically.
- User can revise using free text.
- User can edit manually.
- User can approve the final output.
- User can copy the final output.
- UI is bilingual with Indonesian default.

## Non-goals
- No auto-posting.
- No public onboarding in MVP.
- No advanced analytics.
- No complex team billing in the first version.

## Implementation notes for AI agent
- Build foundation first.
- Keep generation logic isolated.
- Keep revision logic separate from generation logic.
- Make platform formatting deterministic and testable.
- Prefer reusable configuration over hardcoded branching.
- Preserve content history and approval state.
