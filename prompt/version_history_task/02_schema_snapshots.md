# Task 2 — Design schema for snapshots

Add or refine the database schema for version history snapshots.

Requirements:
- Store prompt versions and content versions separately.
- Preserve the original record and every revision.
- Include fields for entity type, entity id, version number, status, author metadata, timestamps, and snapshot payload.
- Keep the schema compatible with PostgreSQL and Drizzle ORM.

Acceptance criteria:
- The schema can store a chronological history.
- Restore-target versions can be identified reliably.
- Current records remain intact.
