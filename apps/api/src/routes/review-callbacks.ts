import { Hono } from 'hono';
import { db } from '@captionsan/db';
import {
  platformOutputs,
  generations,
  projects,
  reviewCallbackEvents,
  isValidTransition,
  isCallbackAllowedState,
  REVIEW_STATES,
} from '@captionsan/db/schema';
import type { ReviewState } from '@captionsan/db/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { requireApiAuth } from '../middleware/api-key.js';
import { recordContentSnapshot } from './version-history.js';

export const reviewCallbackRoutes = new Hono();

// All callback routes require API key auth
reviewCallbackRoutes.use('*', requireApiAuth);

/**
 * POST /api/review-callbacks
 *
 * Receive a review callback from n8n or other external systems.
 *
 * Body:
 * {
 *   outputId: string (required) — platform output ID
 *   status: 'approved' | 'rejected' | 'revision_requested' (required)
 *   externalJobId?: string — n8n workflow execution ID
 *   reviewerIdentifier?: string — who reviewed (email, name, system)
 *   notes?: string — reviewer notes/feedback
 *   providerPayload?: object — raw payload for debugging
 * }
 *
 * Response:
 * - 200: { success: true, event, output }
 * - 400: validation error
 * - 404: output not found
 * - 409: invalid transition or duplicate
 */
reviewCallbackRoutes.post('/', async (c) => {
  const body = await c.req.json<{
    outputId?: string;
    status?: string;
    externalJobId?: string;
    reviewerIdentifier?: string;
    notes?: string;
    providerPayload?: Record<string, unknown>;
  }>();

  // --- Validate required fields ---
  if (!body.outputId) {
    return c.json({ error: 'outputId is required' }, 400);
  }

  if (!body.status) {
    return c.json({ error: 'status is required' }, 400);
  }

  if (!isCallbackAllowedState(body.status)) {
    return c.json(
      {
        error: `Invalid status. Allowed values: approved, rejected, revision_requested`,
      },
      400
    );
  }

  const newStatus = body.status as ReviewState;

  // --- Get the platform output ---
  const [output] = await db
    .select()
    .from(platformOutputs)
    .where(eq(platformOutputs.id, body.outputId))
    .limit(1);

  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const currentStatus = output.approvalStatus as ReviewState;

  // --- Check for duplicate (idempotent) ---
  if (currentStatus === newStatus) {
    // Record as duplicate but don't error
    const [event] = await db
      .insert(reviewCallbackEvents)
      .values({
        platformOutputId: output.id,
        externalJobId: body.externalJobId || null,
        previousStatus: currentStatus,
        newStatus,
        reviewerIdentifier: body.reviewerIdentifier || null,
        notes: body.notes || null,
        source: 'n8n',
        applied: 'duplicate',
        rejectionReason: 'Status already set to this value',
        providerPayload: body.providerPayload || null,
      })
      .returning();

    return c.json(
      {
        success: true,
        duplicate: true,
        event: { id: event.id, applied: event.applied },
        output: {
          id: output.id,
          approvalStatus: currentStatus,
        },
      },
      200
    );
  }

  // --- Validate state transition ---
  if (!isValidTransition(currentStatus, newStatus)) {
    // Record the rejected callback for audit
    const [event] = await db
      .insert(reviewCallbackEvents)
      .values({
        platformOutputId: output.id,
        externalJobId: body.externalJobId || null,
        previousStatus: currentStatus,
        newStatus,
        reviewerIdentifier: body.reviewerIdentifier || null,
        notes: body.notes || null,
        source: 'n8n',
        applied: 'rejected',
        rejectionReason: `Invalid transition: ${currentStatus} → ${newStatus}`,
        providerPayload: body.providerPayload || null,
      })
      .returning();

    return c.json(
      {
        error: `Invalid state transition: ${currentStatus} → ${newStatus}`,
        event: { id: event.id, applied: event.applied },
      },
      409
    );
  }

  // --- Apply the status change ---
  const [updatedOutput] = await db
    .update(platformOutputs)
    .set({
      approvalStatus: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(platformOutputs.id, output.id))
    .returning();

  // --- Record the callback event ---
  const [event] = await db
    .insert(reviewCallbackEvents)
    .values({
      platformOutputId: output.id,
      externalJobId: body.externalJobId || null,
      previousStatus: currentStatus,
      newStatus,
      reviewerIdentifier: body.reviewerIdentifier || null,
      notes: body.notes || null,
      source: 'n8n',
      applied: 'success',
      providerPayload: body.providerPayload || null,
    })
    .returning();

  // --- Record version snapshot for audit trail ---
  const projectId = await getProjectIdForOutput(output.id);
  if (projectId) {
    const statusLabels: Record<string, string> = {
      approved: 'Disetujui via review',
      rejected: 'Ditolak via review',
      revision_requested: 'Revisi diminta via review',
    };

    await recordContentSnapshot({
      outputId: output.id,
      projectId,
      content: updatedOutput.contentCurrent,
      actorType: 'system',
      label: statusLabels[newStatus] || `Status: ${newStatus}`,
      status: newStatus,
      platform: updatedOutput.platform,
      metadata: {
        source: 'n8n_callback',
        externalJobId: body.externalJobId,
        reviewerIdentifier: body.reviewerIdentifier,
        notes: body.notes,
      },
    });
  }

  return c.json({
    success: true,
    event: {
      id: event.id,
      applied: event.applied,
      previousStatus: event.previousStatus,
      newStatus: event.newStatus,
    },
    output: {
      id: updatedOutput.id,
      platform: updatedOutput.platform,
      approvalStatus: updatedOutput.approvalStatus,
      updatedAt: updatedOutput.updatedAt,
    },
  });
});

/**
 * GET /api/review-callbacks/events
 *
 * List all review callback events for the current user's outputs.
 * Used by the admin/review UI.
 */
reviewCallbackRoutes.get('/events', async (c) => {
  const user = c.get('user' as never) as { id: string };

  // Get all user's project IDs
  const userProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.userId, user.id));

  const projectIds = userProjects.map((p) => p.id);

  if (projectIds.length === 0) {
    return c.json({ events: [] });
  }

  // Get generation IDs for user's projects
  const userGenerations = await db
    .select({ id: generations.id })
    .from(generations)
    .where(inArray(generations.projectId, projectIds));

  const generationIds = userGenerations.map((g) => g.id);

  if (generationIds.length === 0) {
    return c.json({ events: [] });
  }

  // Get output IDs for user's generations
  const userOutputs = await db
    .select({ id: platformOutputs.id })
    .from(platformOutputs)
    .where(inArray(platformOutputs.generationId, generationIds));

  const outputIds = userOutputs.map((o) => o.id);

  if (outputIds.length === 0) {
    return c.json({ events: [] });
  }

  // Get all callback events for user's outputs
  const events = await db
    .select()
    .from(reviewCallbackEvents)
    .where(inArray(reviewCallbackEvents.platformOutputId, outputIds))
    .orderBy(desc(reviewCallbackEvents.createdAt))
    .limit(100);

  return c.json({ events });
});

/**
 * GET /api/review-callbacks/:outputId
 *
 * Get all callback events for a specific platform output.
 * Useful for inspecting audit history.
 */
reviewCallbackRoutes.get('/:outputId', async (c) => {
  const outputId = c.req.param('outputId')!;

  // Verify output exists
  const [output] = await db
    .select({ id: platformOutputs.id })
    .from(platformOutputs)
    .where(eq(platformOutputs.id, outputId))
    .limit(1);

  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const events = await db
    .select()
    .from(reviewCallbackEvents)
    .where(eq(reviewCallbackEvents.platformOutputId, outputId))
    .orderBy(reviewCallbackEvents.createdAt);

  return c.json({ events });
});

/**
 * POST /api/review-callbacks/submit-for-review
 *
 * Mark a platform output as "in_review" (internal action).
 * This is the CaptionSan-side trigger before n8n picks it up.
 */
reviewCallbackRoutes.post('/submit-for-review', async (c) => {
  const body = await c.req.json<{ outputId?: string }>();

  if (!body.outputId) {
    return c.json({ error: 'outputId is required' }, 400);
  }

  const [output] = await db
    .select()
    .from(platformOutputs)
    .where(eq(platformOutputs.id, body.outputId))
    .limit(1);

  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const currentStatus = output.approvalStatus as ReviewState;

  if (!isValidTransition(currentStatus, 'in_review')) {
    return c.json(
      { error: `Cannot submit for review from status: ${currentStatus}` },
      409
    );
  }

  const [updatedOutput] = await db
    .update(platformOutputs)
    .set({
      approvalStatus: 'in_review',
      updatedAt: new Date(),
    })
    .where(eq(platformOutputs.id, output.id))
    .returning();

  // Record the event
  const [event] = await db
    .insert(reviewCallbackEvents)
    .values({
      platformOutputId: output.id,
      externalJobId: null,
      previousStatus: currentStatus,
      newStatus: 'in_review',
      reviewerIdentifier: null,
      notes: null,
      source: 'manual',
      applied: 'success',
    })
    .returning();

  // Record version snapshot for audit trail
  const projectId = await getProjectIdForOutput(output.id);
  if (projectId) {
    await recordContentSnapshot({
      outputId: output.id,
      projectId,
      content: updatedOutput.contentCurrent,
      actorType: 'system',
      label: 'Dikirim untuk review',
      status: 'in_review',
      platform: updatedOutput.platform,
      metadata: { source: 'submit_for_review' },
    });
  }

  return c.json({
    success: true,
    output: {
      id: updatedOutput.id,
      platform: updatedOutput.platform,
      approvalStatus: updatedOutput.approvalStatus,
    },
    event: { id: event.id },
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Get the project ID for a platform output by traversing the generation chain.
 */
async function getProjectIdForOutput(outputId: string): Promise<string | null> {
  const [output] = await db
    .select({ generationId: platformOutputs.generationId })
    .from(platformOutputs)
    .where(eq(platformOutputs.id, outputId))
    .limit(1);

  if (!output) return null;

  const [generation] = await db
    .select({ projectId: generations.projectId })
    .from(generations)
    .where(eq(generations.id, output.generationId))
    .limit(1);

  return generation?.projectId || null;
}
