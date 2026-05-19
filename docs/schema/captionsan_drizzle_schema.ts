import { pgTable, text, timestamp, uuid, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('member'),
  locale: text('locale').notNull().default('id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'),
  token: text('token').notNull().unique(),
  invitedBy: uuid('invited_by').references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const providerConnections = pgTable('provider_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  providerName: text('provider_name').notNull(),
  baseUrl: text('base_url').notNull(),
  model: text('model').notNull(),
  encryptedApiKey: text('encrypted_api_key').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  sourceType: text('source_type').notNull(),
  originalInput: text('original_input').notNull(),
  additionalContext: text('additional_context'),
  sourceLanguage: text('source_language').notNull().default('id'),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const generations = pgTable('generations', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  providerConnectionId: uuid('provider_connection_id').references(() => providerConnections.id),
  promptVersion: text('prompt_version').notNull().default('v1'),
  generationStatus: text('generation_status').notNull().default('queued'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const platformOutputs = pgTable('platform_outputs', {
  id: uuid('id').primaryKey().defaultRandom(),
  generationId: uuid('generation_id').notNull().references(() => generations.id),
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

export const revisionMessages = pgTable('revision_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  platformOutputId: uuid('platform_output_id').notNull().references(() => platformOutputs.id),
  actorType: text('actor_type').notNull(),
  instructionText: text('instruction_text').notNull(),
  resultingContent: text('resulting_content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
