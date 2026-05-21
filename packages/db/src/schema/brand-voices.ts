import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const brandVoices = pgTable('brand_voices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  tone: text('tone').notNull(),
  styleRules: text('style_rules'),
  audience: text('audience'),
  bannedWords: jsonb('banned_words').$type<string[]>().default([]),
  ctaPreferences: text('cta_preferences'),
  languageStyle: text('language_style'),
  contentLengthGuidance: text('content_length_guidance'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
