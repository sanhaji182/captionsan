# CaptionSan — Generation Core Subtasks

## Subtask 4.1: AI service abstraction
- Create a provider-agnostic AI service layer.
- Keep model and base URL configurable.
- Keep secrets out of business logic.

## Subtask 4.2: Prompt builder
- Build prompts from project input, platform rules, and tone.
- Keep prompt construction testable.
- Preserve the source topic in every prompt.

## Subtask 4.3: Generation job storage
- Store generation job metadata.
- Track job status.
- Link outputs back to the project.

## Subtask 4.4: Platform output creation
- Generate output records per selected platform.
- Store original AI output and current output.
- Keep the output structure ready for revision.
