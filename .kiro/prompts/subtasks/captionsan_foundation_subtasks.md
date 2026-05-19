# CaptionSan — Foundation Subtasks

## Subtask 1.1: Repo inspection and setup
- Inspect current repository structure.
- Identify framework versions and existing conventions.
- Report the files that matter before changing anything.

## Subtask 1.2: Environment configuration
- Add or verify required environment variables.
- Separate public and server-only env values.
- Ensure env names match the codebase conventions.

## Subtask 1.3: Database and migration baseline
- Set up PostgreSQL connection if missing.
- Wire Drizzle configuration.
- Create initial migration flow.
- Verify schema generation works.

## Subtask 1.4: Better Auth baseline
- Add auth foundation.
- Keep invite-only flow in mind.
- Verify user/session access works.

## Subtask 1.5: Invite-only guard
- Block non-invited access.
- Add invite acceptance flow.
- Make sure the app still renders for authorized users.
