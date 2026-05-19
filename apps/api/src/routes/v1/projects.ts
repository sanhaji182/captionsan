import { Hono } from 'hono';
import { db } from '@captionsan/db';
import {
  projects,
  generations,
  platformOutputs,
  revisionMessages,
} from '@captionsan/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const v1Projects = new Hono();

/**
 * GET /v1/projects
 * List all projects for the authenticated user.
 *
 * Response: { projects: Project[] }
 */
v1Projects.get('/', async (c) => {
  const user = c.get('user' as never) as { id: string };

  const userProjects = await db
    .select({
      id: projects.id,
      title: projects.title,
      sourceType: projects.sourceType,
      sourceLanguage: projects.sourceLanguage,
      status: projects.status,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.createdAt));

  return c.json({ projects: userProjects });
});

/**
 * GET /v1/projects/:id
 * Get full project detail with outputs and revision history.
 *
 * Response: { project, generations, outputs, revisions }
 */
v1Projects.get('/:id', async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Get all generations
  const projectGenerations = await db
    .select()
    .from(generations)
    .where(eq(generations.projectId, id))
    .orderBy(desc(generations.createdAt));

  // Get all outputs across all generations
  const generationIds = projectGenerations.map((g) => g.id);
  let outputs: Array<typeof platformOutputs.$inferSelect> = [];

  if (generationIds.length > 0) {
    // Get outputs for the latest generation
    const latestGenId = projectGenerations[0]?.id;
    if (latestGenId) {
      outputs = await db
        .select()
        .from(platformOutputs)
        .where(eq(platformOutputs.generationId, latestGenId));
    }
  }

  // Get revision history for all outputs
  const outputIds = outputs.map((o) => o.id);
  let revisions: Array<typeof revisionMessages.$inferSelect> = [];

  if (outputIds.length > 0) {
    const allRevisions: Array<typeof revisionMessages.$inferSelect> = [];
    for (const outputId of outputIds) {
      const outputRevisions = await db
        .select()
        .from(revisionMessages)
        .where(eq(revisionMessages.platformOutputId, outputId))
        .orderBy(desc(revisionMessages.createdAt));
      allRevisions.push(...outputRevisions);
    }
    revisions = allRevisions;
  }

  return c.json({
    project,
    generations: projectGenerations,
    outputs: outputs.map((o) => ({
      id: o.id,
      platform: o.platform,
      tone: o.tone,
      characterCount: o.characterCount,
      contentOriginalAi: o.contentOriginalAi,
      contentCurrent: o.contentCurrent,
      approvalStatus: o.approvalStatus,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })),
    revisions: revisions.map((r) => ({
      id: r.id,
      platformOutputId: r.platformOutputId,
      actorType: r.actorType,
      instructionText: r.instructionText,
      resultingContent: r.resultingContent,
      createdAt: r.createdAt,
    })),
  });
});

/**
 * POST /v1/projects
 * Create a new project.
 *
 * Body: { title, sourceType, originalInput, additionalContext?, sourceLanguage? }
 * Response: { project }
 */
v1Projects.post('/', async (c) => {
  const user = c.get('user' as never) as { id: string };
  const body = await c.req.json<{
    title: string;
    sourceType: string;
    originalInput: string;
    additionalContext?: string;
    sourceLanguage?: string;
  }>();

  if (!body.title || !body.originalInput || !body.sourceType) {
    return c.json({ error: 'title, sourceType, and originalInput are required' }, 400);
  }

  if (!['idea', 'draft'].includes(body.sourceType)) {
    return c.json({ error: 'sourceType must be "idea" or "draft"' }, 400);
  }

  const [project] = await db
    .insert(projects)
    .values({
      userId: user.id,
      title: body.title,
      sourceType: body.sourceType,
      originalInput: body.originalInput,
      additionalContext: body.additionalContext || null,
      sourceLanguage: body.sourceLanguage || 'id',
      status: 'draft',
    })
    .returning();

  return c.json({ project }, 201);
});
