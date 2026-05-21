import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const promptTemplates = pgTable('prompt_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  platforms: jsonb('platforms').$type<string[]>().default([]),
  promptBody: text('prompt_body').notNull(),
  placeholders: jsonb('placeholders').$type<TemplatePlaceholder[]>().default([]),
  notes: text('notes'),
  isFavorite: boolean('is_favorite').notNull().default(false),
  isDefault: boolean('is_default').notNull().default(false),
  usageCount: integer('usage_count').notNull().default(0),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export interface TemplatePlaceholder {
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
}

export const templateUsageHistory = pgTable('template_usage_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => promptTemplates.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id'),
  substitutedValues: jsonb('substituted_values').$type<Record<string, string>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
