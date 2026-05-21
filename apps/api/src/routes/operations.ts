import { Hono } from 'hono';
import { db } from '@captionsan/db';
import {
  projects,
  generations,
  platformOutputs,
  providerConnections,
} from '@captionsan/db/schema';
import { eq, and, desc, gte, lte, sql, inArray } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

export const operationsRoutes = new Hono();

// Dashboard summary stats
operationsRoutes.get('/summary', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };

  // Total projects
  const [projectCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(eq(projects.userId, user.id));

  // Projects by status
  const projectsByStatus = await db
    .select({
      status: projects.status,
      count: sql<number>`count(*)::int`,
    })
    .from(projects)
    .where(eq(projects.userId, user.id))
    .groupBy(projects.status);

  // Get user's project IDs for generation queries
  const userProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.userId, user.id));

  const projectIds = userProjects.map((p) => p.id);

  let totalGenerations = 0;
  let generationsByStatus: Array<{ status: string; count: number }> = [];
  let totalOutputs = 0;
  let outputsByPlatform: Array<{ platform: string; count: number }> = [];
  let outputsByApproval: Array<{ status: string; count: number }> = [];

  if (projectIds.length > 0) {
    // Total generations
    const [genCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(generations)
      .where(inArray(generations.projectId, projectIds));
    totalGenerations = genCount?.count || 0;

    // Generations by status
    generationsByStatus = await db
      .select({
        status: generations.generationStatus,
        count: sql<number>`count(*)::int`,
      })
      .from(generations)
      .where(inArray(generations.projectId, projectIds))
      .groupBy(generations.generationStatus);

    // Get generation IDs for output queries
    const userGenerations = await db
      .select({ id: generations.id })
      .from(generations)
      .where(inArray(generations.projectId, projectIds));

    const generationIds = userGenerations.map((g) => g.id);

    if (generationIds.length > 0) {
      // Total outputs
      const [outCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(platformOutputs)
        .where(inArray(platformOutputs.generationId, generationIds));
      totalOutputs = outCount?.count || 0;

      // Outputs by platform
      outputsByPlatform = await db
        .select({
          platform: platformOutputs.platform,
          count: sql<number>`count(*)::int`,
        })
        .from(platformOutputs)
        .where(inArray(platformOutputs.generationId, generationIds))
        .groupBy(platformOutputs.platform);

      // Outputs by approval status
      outputsByApproval = await db
        .select({
          status: platformOutputs.approvalStatus,
          count: sql<number>`count(*)::int`,
        })
        .from(platformOutputs)
        .where(inArray(platformOutputs.generationId, generationIds))
        .groupBy(platformOutputs.approvalStatus);
    }
  }

  return c.json({
    projects: {
      total: projectCount?.count || 0,
      byStatus: projectsByStatus,
    },
    generations: {
      total: totalGenerations,
      byStatus: generationsByStatus,
    },
    outputs: {
      total: totalOutputs,
      byPlatform: outputsByPlatform,
      byApproval: outputsByApproval,
    },
  });
});

// List generation jobs with filtering
operationsRoutes.get('/jobs', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const status = c.req.query('status');
  const projectId = c.req.query('projectId');
  const platform = c.req.query('platform');
  const dateFrom = c.req.query('dateFrom');
  const dateTo = c.req.query('dateTo');
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  // Get user's project IDs (optionally filtered by projectId)
  const projectConditions = [eq(projects.userId, user.id)];
  if (projectId) {
    projectConditions.push(eq(projects.id, projectId));
  }

  const userProjects = await db
    .select({ id: projects.id, title: projects.title })
    .from(projects)
    .where(and(...projectConditions));

  const projectIds = userProjects.map((p) => p.id);
  const projectMap = Object.fromEntries(userProjects.map((p) => [p.id, p.title]));

  if (projectIds.length === 0) {
    return c.json({ jobs: [], total: 0 });
  }

  // Build generation query conditions
  const genConditions: ReturnType<typeof eq>[] = [inArray(generations.projectId, projectIds)];

  if (status) {
    genConditions.push(eq(generations.generationStatus, status));
  }
  if (dateFrom) {
    genConditions.push(gte(generations.createdAt, new Date(dateFrom)));
  }
  if (dateTo) {
    genConditions.push(lte(generations.createdAt, new Date(dateTo)));
  }

  // Count total
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(generations)
    .where(and(...genConditions));

  // Fetch generations
  const genResults = await db
    .select()
    .from(generations)
    .where(and(...genConditions))
    .orderBy(desc(generations.createdAt))
    .limit(limit)
    .offset(offset);

  // Fetch outputs for these generations
  const genIds = genResults.map((g) => g.id);
  let outputsMap: Record<string, Array<{ platform: string; approvalStatus: string; characterCount: number }>> = {};

  if (genIds.length > 0) {
    const outputs = await db
      .select({
        generationId: platformOutputs.generationId,
        platform: platformOutputs.platform,
        approvalStatus: platformOutputs.approvalStatus,
        characterCount: platformOutputs.characterCount,
      })
      .from(platformOutputs)
      .where(inArray(platformOutputs.generationId, genIds));

    // Group by generationId
    for (const output of outputs) {
      if (!outputsMap[output.generationId]) {
        outputsMap[output.generationId] = [];
      }
      outputsMap[output.generationId].push({
        platform: output.platform,
        approvalStatus: output.approvalStatus,
        characterCount: output.characterCount,
      });
    }
  }

  // If platform filter is set, only include generations that have that platform
  let jobs = genResults.map((gen) => ({
    id: gen.id,
    projectId: gen.projectId,
    projectTitle: projectMap[gen.projectId] || 'Unknown',
    status: gen.generationStatus,
    createdAt: gen.createdAt,
    outputs: outputsMap[gen.id] || [],
  }));

  if (platform) {
    jobs = jobs.filter((job) =>
      job.outputs.some((o) => o.platform === platform)
    );
  }

  return c.json({
    jobs,
    total: totalResult?.count || 0,
    limit,
    offset,
  });
});

// Recent activity feed
operationsRoutes.get('/activity', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const limit = parseInt(c.req.query('limit') || '15', 10);

  // Get user's projects
  const userProjects = await db
    .select({ id: projects.id, title: projects.title, status: projects.status, updatedAt: projects.updatedAt })
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.updatedAt))
    .limit(limit);

  const projectIds = userProjects.map((p) => p.id);

  if (projectIds.length === 0) {
    return c.json({ activity: [] });
  }

  // Get recent generations
  const recentGenerations = await db
    .select({
      id: generations.id,
      projectId: generations.projectId,
      status: generations.generationStatus,
      createdAt: generations.createdAt,
    })
    .from(generations)
    .where(inArray(generations.projectId, projectIds))
    .orderBy(desc(generations.createdAt))
    .limit(limit);

  const projectMap = Object.fromEntries(userProjects.map((p) => [p.id, p.title]));

  // Build activity items
  type ActivityItem = {
    type: string;
    id: string;
    projectId: string;
    projectTitle: string;
    description: string;
    status: string;
    timestamp: Date;
  };

  const activity: ActivityItem[] = [];

  // Add project updates
  for (const p of userProjects) {
    activity.push({
      type: 'project',
      id: p.id,
      projectId: p.id,
      projectTitle: p.title,
      description: `Proyek "${p.title}" diperbarui`,
      status: p.status,
      timestamp: p.updatedAt,
    });
  }

  // Add generation events
  for (const g of recentGenerations) {
    const statusLabel = g.status === 'completed' ? 'selesai' : g.status === 'failed' ? 'gagal' : g.status;
    activity.push({
      type: 'generation',
      id: g.id,
      projectId: g.projectId,
      projectTitle: projectMap[g.projectId] || 'Unknown',
      description: `Generasi konten ${statusLabel}`,
      status: g.status,
      timestamp: g.createdAt,
    });
  }

  // Sort by timestamp descending
  activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return c.json({ activity: activity.slice(0, limit) });
});
