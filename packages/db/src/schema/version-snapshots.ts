import { pgTable, text, timestamp, uuid, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const versionSnapshots = pgTable(
  'version_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: text('entity_type').notNull(), // 'prompt' | 'content'
    entityId: uuid('entity_id').notNull(), // prompt_drafts.id or platform_outputs.id
    projectId: uuid('project_id').notNull(),
    versionNumber: integer('version_number').notNull(),
    versionLabel: text('version_label').notNull(),
    status: text('status').notNull().default('draft'), // 'draft' | 'approved'
    actorType: text('actor_type').notNull(), // 'ai' | 'user' | 'template' | 'system'
    content: text('content').notNull(),
    metadata: jsonb('metadata').$type<VersionMetadata>().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_version_snapshots_entity').on(table.entityType, table.entityId),
    index('idx_version_snapshots_project').on(table.projectId),
  ]
);

export interface VersionMetadata {
  instructionText?: string;
  templateId?: string;
  platform?: string;
  restoredFromVersion?: number;
  [key: string]: unknown;
}
