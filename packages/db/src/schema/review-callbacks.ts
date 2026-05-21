/**
 * Review callback schema for n8n integration.
 *
 * Review states: draft | in_review | approved | rejected | revision_requested
 *
 * CaptionSan is the source of truth for all review states.
 * Callbacks from n8n update status only through validated transitions.
 */

import { pgTable, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { platformOutputs } from './generations.js';

// ─── Review States ───────────────────────────────────────────────────────────

/**
 * Valid review/approval states for platform outputs.
 */
export const REVIEW_STATES = [
  'draft',
  'in_review',
  'approved',
  'rejected',
  'revision_requested',
] as const;

export type ReviewState = (typeof REVIEW_STATES)[number];

/**
 * Valid state transitions map.
 * Key = current state, Value = array of allowed next states.
 */
export const VALID_TRANSITIONS: Record<ReviewState, readonly ReviewState[]> = {
  draft: ['in_review', 'approved'],
  in_review: ['approved', 'rejected', 'revision_requested'],
  approved: [], // Terminal state (no further transitions via callback)
  rejected: ['draft', 'in_review'],
  revision_requested: ['draft', 'in_review'],
} as const;

/**
 * Check if a state transition is valid.
 */
export function isValidTransition(from: ReviewState, to: ReviewState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * States that can be set by an n8n callback (external actor).
 */
export const CALLBACK_ALLOWED_STATES: readonly ReviewState[] = [
  'approved',
  'rejected',
  'revision_requested',
] as const;

/**
 * Check if a state can be set via external callback.
 */
export function isCallbackAllowedState(state: string): state is ReviewState {
  return (CALLBACK_ALLOWED_STATES as readonly string[]).includes(state);
}

// ─── Review Callback Events Table ────────────────────────────────────────────

/**
 * Stores every review callback event received from n8n or other external systems.
 * Acts as an audit log for all review state changes triggered externally.
 */
export const reviewCallbackEvents = pgTable(
  'review_callback_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    /** The platform output this callback relates to. */
    platformOutputId: uuid('platform_output_id')
      .notNull()
      .references(() => platformOutputs.id, { onDelete: 'cascade' }),

    /** External job/workflow ID from n8n. */
    externalJobId: text('external_job_id'),

    /** The status before this callback was applied. */
    previousStatus: text('previous_status').notNull(),

    /** The new status set by this callback. */
    newStatus: text('new_status').notNull(),

    /** Who triggered this callback (e.g. reviewer email, name, or system ID). */
    reviewerIdentifier: text('reviewer_identifier'),

    /** Free-text notes from the reviewer. */
    notes: text('notes'),

    /** Source system identifier (e.g. 'n8n', 'manual', 'api'). */
    source: text('source').notNull().default('n8n'),

    /** Whether this callback was successfully applied. */
    applied: text('applied').notNull().default('success'), // 'success' | 'rejected' | 'duplicate'

    /** Reason if the callback was rejected (invalid transition, duplicate, etc.). */
    rejectionReason: text('rejection_reason'),

    /** Raw payload from the external system for debugging. */
    providerPayload: jsonb('provider_payload').$type<Record<string, unknown>>(),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_review_callback_output').on(table.platformOutputId),
    index('idx_review_callback_external_job').on(table.externalJobId),
    index('idx_review_callback_created').on(table.createdAt),
  ]
);
