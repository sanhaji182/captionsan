import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';

export const promptDrafts = pgTable('prompt_drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  promptOriginal: text('prompt_original').notNull(),
  promptCurrent: text('prompt_current').notNull(),
  promptApproved: boolean('prompt_approved').notNull().default(false),
  promptStatus: text('prompt_status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const promptRevisions = pgTable('prompt_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  promptDraftId: uuid('prompt_draft_id').notNull().references(() => promptDrafts.id, { onDelete: 'cascade' }),
  actorType: text('actor_type').notNull(),
  instructionText: text('instruction_text').notNull(),
  resultingPrompt: text('resulting_prompt').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
