# Task 3 — Callback API

Create backend API endpoints for n8n review callbacks.

Requirements:
- Accept review status updates from n8n.
- Validate job id, status, and optional notes.
- Reject unauthorized or malformed requests.
- Update CaptionSan job status safely without overwriting important history.

Acceptance criteria:
- The API can receive n8n review results.
- Invalid callbacks are rejected.
- CaptionSan remains the source of truth.
