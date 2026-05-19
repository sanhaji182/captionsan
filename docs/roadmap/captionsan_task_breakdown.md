# CaptionSan — Task Breakdown

## Milestone 1: Foundation
1. Initialize repo structure.
2. Add environment configuration.
3. Set up database connection and Drizzle migration flow.
4. Add Better Auth baseline.
5. Add invite-only access guard.

## Milestone 2: Provider setup
1. Create provider connection model.
2. Add UI for saving OpenAI-compatible provider keys.
3. Add encryption handling for API keys.
4. Add provider health check.

## Milestone 3: Project creation
1. Add project model.
2. Add create project UI.
3. Store original input and additional context.
4. Add project history list.

## Milestone 4: AI generation
1. Build AI service abstraction.
2. Build prompt assembly from input and platform rules.
3. Generate outputs per selected platform.
4. Store generation job and platform outputs.

## Milestone 5: Platform formatting
1. Add platform-specific output rules.
2. Add tone selection per platform.
3. Add character-aware formatting.
4. Add thread numbering logic.

## Milestone 6: Revision loop
1. Add manual edit capability.
2. Add free-text revision form.
3. Send revision instruction to AI.
4. Save revision history.
5. Update approval state.

## Milestone 7: UX and copy flow
1. Add compare view for original vs current output.
2. Add approve action.
3. Add copy per platform.
4. Add copy all action.

## Milestone 8: API readiness
1. Expose generation endpoints.
2. Expose revision endpoints.
3. Expose project retrieval endpoints.
4. Prepare auth scopes for external pipeline usage.
