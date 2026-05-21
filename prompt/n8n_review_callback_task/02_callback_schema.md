# Task 2 — Callback Schema

Design or refine the database schema needed for review callbacks.

Requirements:
- Store job id, callback status, reviewer metadata, notes, timestamps, and provider payload.
- Keep the schema compatible with PostgreSQL and Drizzle ORM.
- Preserve existing records safely.
- Make the schema reusable for future automation callbacks.

Acceptance criteria:
- Review callback data can be stored reliably.
- Status changes are auditable.
- Current data remains intact.
