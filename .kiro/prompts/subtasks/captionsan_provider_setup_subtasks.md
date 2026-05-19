# CaptionSan — Provider Setup Subtasks

## Subtask 2.1: Provider schema
- Define provider connection model.
- Include provider name, base URL, model, encrypted key, default flag.
- Keep it separate from project records.

## Subtask 2.2: Provider storage API
- Add CRUD endpoints or server actions for provider config.
- Ensure keys are not exposed back to the UI.
- Add validation for OpenAI-compatible fields.

## Subtask 2.3: Provider settings UI
- Create settings page or modal.
- Allow user to add/update provider configuration.
- Keep UI simple and clear.

## Subtask 2.4: Connection test
- Add test connection action.
- Return clear success or failure state.
- Use the saved provider config for validation.
