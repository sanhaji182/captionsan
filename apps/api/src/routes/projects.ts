import { Hono } from 'hono';
import { db } from '@captionsan/db';
import { projects } from '@captionsan/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

export const projectRoutes = new Hono();

// List user's projects
projectRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.createdAt));

  return c.json({ projects: userProjects });
});

// Get single project
projectRoutes.get('/:id', requireAuth, async (c) => {
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

  return c.json({ project });
});

// Create project
projectRoutes.post('/', requireAuth, async (c) => {
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

// Update project
projectRoutes.put('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;
  const body = await c.req.json<{
    title?: string;
    additionalContext?: string;
    status?: string;
  }>();

  // Verify ownership
  const [existing] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.title) updateData.title = body.title;
  if (body.additionalContext !== undefined) updateData.additionalContext = body.additionalContext;
  if (body.status) {
    if (!['draft', 'generating', 'review', 'approved'].includes(body.status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    updateData.status = body.status;
  }

  const [updated] = await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, id))
    .returning();

  return c.json({ project: updated });
});

// Delete project
projectRoutes.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [existing] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await db.delete(projects).where(eq(projects.id, id));

  return c.json({ deleted: true });
});
