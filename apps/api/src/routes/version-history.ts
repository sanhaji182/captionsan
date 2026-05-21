import { Hono } from 'hono';
import { db } from '@captionsan/db';
import {
  versionSnapshots,
  projects,
  promptDrafts,
  platformOutputs,
} from '@captionsan/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

export const versionHistoryRoutes = new Hono();

// List prompt version history for a project
versionHistoryRoutes.get('/projects/:projectId/prompt-history', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const projectId = c.req.param('projectId')!;

  // Verify project ownership
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const snapshots = await db
    .select()
    .from(versionSnapshots)
    .where(
      and(
        eq(versionSnapshots.projectId, projectId),
        eq(versionSnapshots.entityType, 'prompt')
      )
    )
    .orderBy(desc(versionSnapshots.versionNumber));

  return c.json({ history: snapshots });
});

// List content version history for a specific platform output
versionHistoryRoutes.get('/outputs/:outputId/content-history', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const outputId = c.req.param('outputId')!;

  // Verify ownership through the chain: output → generation → project → user
  const [output] = await db
    .select({ id: platformOutputs.id, generationId: platformOutputs.generationId })
    .from(platformOutputs)
    .where(eq(platformOutputs.id, outputId))
    .limit(1);

  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  // Get projectId from the snapshot itself (or verify via generation chain)
  const snapshots = await db
    .select()
    .from(versionSnapshots)
    .where(
      and(
        eq(versionSnapshots.entityId, outputId),
        eq(versionSnapshots.entityType, 'content')
      )
    )
    .orderBy(desc(versionSnapshots.versionNumber));

  return c.json({ history: snapshots });
});

// Get a single version snapshot detail
versionHistoryRoutes.get('/versions/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [snapshot] = await db
    .select()
    .from(versionSnapshots)
    .where(eq(versionSnapshots.id, id))
    .limit(1);

  if (!snapshot) {
    return c.json({ error: 'Version not found' }, 404);
  }

  // Verify project ownership
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, snapshot.projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Version not found' }, 404);
  }

  return c.json({ version: snapshot });
});

// Compare two versions (diff)
versionHistoryRoutes.get('/versions/compare', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const versionAId = c.req.query('a');
  const versionBId = c.req.query('b');

  if (!versionAId || !versionBId) {
    return c.json({ error: 'Both version IDs (a, b) are required' }, 400);
  }

  const [versionA] = await db
    .select()
    .from(versionSnapshots)
    .where(eq(versionSnapshots.id, versionAId))
    .limit(1);

  const [versionB] = await db
    .select()
    .from(versionSnapshots)
    .where(eq(versionSnapshots.id, versionBId))
    .limit(1);

  if (!versionA || !versionB) {
    return c.json({ error: 'One or both versions not found' }, 404);
  }

  // Must be same entity
  if (versionA.entityType !== versionB.entityType || versionA.entityId !== versionB.entityId) {
    return c.json({ error: 'Can only compare versions of the same entity' }, 400);
  }

  // Verify project ownership
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, versionA.projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Version not found' }, 404);
  }

  const diff = computeLineDiff(versionA.content, versionB.content);

  return c.json({
    versionA: {
      id: versionA.id,
      versionNumber: versionA.versionNumber,
      versionLabel: versionA.versionLabel,
      actorType: versionA.actorType,
      createdAt: versionA.createdAt,
    },
    versionB: {
      id: versionB.id,
      versionNumber: versionB.versionNumber,
      versionLabel: versionB.versionLabel,
      actorType: versionB.actorType,
      createdAt: versionB.createdAt,
    },
    diff,
  });
});

// Restore a prompt version
versionHistoryRoutes.post('/projects/:projectId/prompt-history/restore', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const projectId = c.req.param('projectId')!;
  const body = await c.req.json<{ versionId: string }>();

  if (!body.versionId) {
    return c.json({ error: 'versionId is required' }, 400);
  }

  // Verify project ownership
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Get the target version
  const [targetVersion] = await db
    .select()
    .from(versionSnapshots)
    .where(
      and(
        eq(versionSnapshots.id, body.versionId),
        eq(versionSnapshots.projectId, projectId),
        eq(versionSnapshots.entityType, 'prompt')
      )
    )
    .limit(1);

  if (!targetVersion) {
    return c.json({ error: 'Version not found or does not belong to this project' }, 404);
  }

  // Get the latest prompt draft for this project
  const [promptDraft] = await db
    .select()
    .from(promptDrafts)
    .where(eq(promptDrafts.projectId, projectId))
    .orderBy(desc(promptDrafts.createdAt))
    .limit(1);

  if (!promptDraft) {
    return c.json({ error: 'No prompt draft found for this project' }, 404);
  }

  // Don't restore if prompt is already approved
  if (promptDraft.promptApproved) {
    return c.json({ error: 'Cannot restore on an approved prompt' }, 400);
  }

  // Update the prompt draft with the restored content
  const [updatedDraft] = await db
    .update(promptDrafts)
    .set({ promptCurrent: targetVersion.content, updatedAt: new Date() })
    .where(eq(promptDrafts.id, promptDraft.id))
    .returning();

  // Get the current max version number
  const [maxVersion] = await db
    .select({ max: sql<number>`COALESCE(MAX(${versionSnapshots.versionNumber}), 0)` })
    .from(versionSnapshots)
    .where(
      and(
        eq(versionSnapshots.entityType, 'prompt'),
        eq(versionSnapshots.entityId, promptDraft.id)
      )
    );

  const newVersionNumber = (maxVersion?.max || 0) + 1;

  // Create a new snapshot for the restore action
  const [newSnapshot] = await db
    .insert(versionSnapshots)
    .values({
      entityType: 'prompt',
      entityId: promptDraft.id,
      projectId,
      versionNumber: newVersionNumber,
      versionLabel: `Restore dari v${targetVersion.versionNumber}`,
      status: promptDraft.promptStatus,
      actorType: 'user',
      content: targetVersion.content,
      metadata: { restoredFromVersion: targetVersion.versionNumber },
    })
    .returning();

  return c.json({ promptDraft: updatedDraft, version: newSnapshot });
});

// Restore a content version
versionHistoryRoutes.post('/outputs/:outputId/content-history/restore', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const outputId = c.req.param('outputId')!;
  const body = await c.req.json<{ versionId: string }>();

  if (!body.versionId) {
    return c.json({ error: 'versionId is required' }, 400);
  }

  // Get the output
  const [output] = await db
    .select()
    .from(platformOutputs)
    .where(eq(platformOutputs.id, outputId))
    .limit(1);

  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  // Don't restore if content is already approved
  if (output.approvalStatus === 'approved') {
    return c.json({ error: 'Cannot restore on approved content' }, 400);
  }

  // Get the target version
  const [targetVersion] = await db
    .select()
    .from(versionSnapshots)
    .where(
      and(
        eq(versionSnapshots.id, body.versionId),
        eq(versionSnapshots.entityId, outputId),
        eq(versionSnapshots.entityType, 'content')
      )
    )
    .limit(1);

  if (!targetVersion) {
    return c.json({ error: 'Version not found or does not belong to this output' }, 404);
  }

  // Update the platform output
  const [updatedOutput] = await db
    .update(platformOutputs)
    .set({
      contentCurrent: targetVersion.content,
      characterCount: targetVersion.content.length,
      updatedAt: new Date(),
    })
    .where(eq(platformOutputs.id, outputId))
    .returning();

  // Get the current max version number
  const [maxVersion] = await db
    .select({ max: sql<number>`COALESCE(MAX(${versionSnapshots.versionNumber}), 0)` })
    .from(versionSnapshots)
    .where(
      and(
        eq(versionSnapshots.entityType, 'content'),
        eq(versionSnapshots.entityId, outputId)
      )
    );

  const newVersionNumber = (maxVersion?.max || 0) + 1;

  // Create a new snapshot for the restore action
  const [newSnapshot] = await db
    .insert(versionSnapshots)
    .values({
      entityType: 'content',
      entityId: outputId,
      projectId: targetVersion.projectId,
      versionNumber: newVersionNumber,
      versionLabel: `Restore dari v${targetVersion.versionNumber}`,
      status: output.approvalStatus,
      actorType: 'user',
      content: targetVersion.content,
      metadata: {
        restoredFromVersion: targetVersion.versionNumber,
        platform: output.platform,
      },
    })
    .returning();

  return c.json({ output: updatedOutput, version: newSnapshot });
});

// --- Helper: Record a version snapshot (used by other routes) ---
export async function recordPromptSnapshot(params: {
  promptDraftId: string;
  projectId: string;
  content: string;
  actorType: string;
  label: string;
  status: string;
  metadata?: Record<string, unknown>;
}) {
  const [maxVersion] = await db
    .select({ max: sql<number>`COALESCE(MAX(${versionSnapshots.versionNumber}), 0)` })
    .from(versionSnapshots)
    .where(
      and(
        eq(versionSnapshots.entityType, 'prompt'),
        eq(versionSnapshots.entityId, params.promptDraftId)
      )
    );

  const versionNumber = (maxVersion?.max || 0) + 1;

  const [snapshot] = await db
    .insert(versionSnapshots)
    .values({
      entityType: 'prompt',
      entityId: params.promptDraftId,
      projectId: params.projectId,
      versionNumber,
      versionLabel: params.label,
      status: params.status,
      actorType: params.actorType,
      content: params.content,
      metadata: params.metadata || {},
    })
    .returning();

  return snapshot;
}

export async function recordContentSnapshot(params: {
  outputId: string;
  projectId: string;
  content: string;
  actorType: string;
  label: string;
  status: string;
  platform: string;
  metadata?: Record<string, unknown>;
}) {
  const [maxVersion] = await db
    .select({ max: sql<number>`COALESCE(MAX(${versionSnapshots.versionNumber}), 0)` })
    .from(versionSnapshots)
    .where(
      and(
        eq(versionSnapshots.entityType, 'content'),
        eq(versionSnapshots.entityId, params.outputId)
      )
    );

  const versionNumber = (maxVersion?.max || 0) + 1;

  const [snapshot] = await db
    .insert(versionSnapshots)
    .values({
      entityType: 'content',
      entityId: params.outputId,
      projectId: params.projectId,
      versionNumber,
      versionLabel: params.label,
      status: params.status,
      actorType: params.actorType,
      content: params.content,
      metadata: { ...params.metadata, platform: params.platform },
    })
    .returning();

  return snapshot;
}

// --- Task 4: Diff support ---
export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: { old?: number; new?: number };
}

export function computeLineDiff(textA: string, textB: string): DiffLine[] {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');

  // Simple LCS-based line diff
  const lcs = computeLCS(linesA, linesB);
  const diff: DiffLine[] = [];

  let idxA = 0;
  let idxB = 0;
  let lcsIdx = 0;

  while (idxA < linesA.length || idxB < linesB.length) {
    if (lcsIdx < lcs.length && idxA < linesA.length && linesA[idxA] === lcs[lcsIdx] &&
        idxB < linesB.length && linesB[idxB] === lcs[lcsIdx]) {
      // Unchanged line
      diff.push({
        type: 'unchanged',
        content: linesA[idxA],
        lineNumber: { old: idxA + 1, new: idxB + 1 },
      });
      idxA++;
      idxB++;
      lcsIdx++;
    } else if (idxA < linesA.length && (lcsIdx >= lcs.length || linesA[idxA] !== lcs[lcsIdx])) {
      // Removed from A
      diff.push({
        type: 'removed',
        content: linesA[idxA],
        lineNumber: { old: idxA + 1 },
      });
      idxA++;
    } else if (idxB < linesB.length && (lcsIdx >= lcs.length || linesB[idxB] !== lcs[lcsIdx])) {
      // Added in B
      diff.push({
        type: 'added',
        content: linesB[idxB],
        lineNumber: { new: idxB + 1 },
      });
      idxB++;
    }
  }

  return diff;
}

function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find LCS
  const result: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}
