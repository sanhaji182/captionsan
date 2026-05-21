import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';
import { providerConnections } from './providers.js';
import { promptDrafts } from './prompt-drafts.js';

export const generations = pgTable('generations', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  promptDraftId: uuid('prompt_draft_id').references(() => promptDrafts.id),
  providerConnectionId: uuid('provider_connection_id').references(() => providerConnections.id),
  promptVersion: text('prompt_version').notNull().default('v1'),
  generationStatus: text('generation_status').notNull().default('queued'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const platformOutputs = pgTable('platform_outputs', {
  id: uuid('id').primaryKey().defaultRandom(),
  generationId: uuid('generation_id').notNull().references(() => generations.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  tone: text('tone').notNull(),
  targetLength: integer('target_length'),
  characterCount: integer('character_count').notNull().default(0),
  contentOriginalAi: text('content_original_ai').notNull(),
  contentCurrent: text('content_current').notNull(),
  approvalStatus: text('approval_status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const contentRevisions = pgTable('revision_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  platformOutputId: uuid('platform_output_id').notNull().references(() => platformOutputs.id, { onDelete: 'cascade' }),
  actorType: text('actor_type').notNull(),
  instructionText: text('instruction_text').notNull(),
  resultingContent: text('resulting_content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/** @deprecated Use `contentRevisions` instead */
export const revisionMessages = contentRevisions;
