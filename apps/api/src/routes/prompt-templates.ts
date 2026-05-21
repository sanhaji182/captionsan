import { Hono } from 'hono';
import { db } from '@captionsan/db';
import { promptTemplates, templateUsageHistory } from '@captionsan/db/schema';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

export const promptTemplateRoutes = new Hono();

// List user's prompt templates (with optional search/filter)
promptTemplateRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const search = c.req.query('search');
  const category = c.req.query('category');
  const favoritesOnly = c.req.query('favorites') === 'true';

  let query = db
    .select()
    .from(promptTemplates)
    .where(eq(promptTemplates.userId, user.id))
    .$dynamic();

  // Apply filters
  const conditions = [eq(promptTemplates.userId, user.id)];

  if (search) {
    conditions.push(
      or(
        ilike(promptTemplates.name, `%${search}%`),
        ilike(promptTemplates.description, `%${search}%`),
        ilike(promptTemplates.promptBody, `%${search}%`)
      )!
    );
  }

  if (category) {
    conditions.push(eq(promptTemplates.category, category));
  }

  if (favoritesOnly) {
    conditions.push(eq(promptTemplates.isFavorite, true));
  }

  const templates = await db
    .select()
    .from(promptTemplates)
    .where(and(...conditions))
    .orderBy(desc(promptTemplates.updatedAt));

  return c.json({ templates });
});

// Get single prompt template
promptTemplateRoutes.get('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [template] = await db
    .select()
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.userId, user.id)))
    .limit(1);

  if (!template) {
    return c.json({ error: 'Template not found' }, 404);
  }

  return c.json({ template });
});

// Create prompt template
promptTemplateRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const body = await c.req.json<{
    name: string;
    description?: string;
    category?: string;
    platforms?: string[];
    promptBody: string;
    placeholders?: Array<{
      key: string;
      label: string;
      description?: string;
      defaultValue?: string;
      required?: boolean;
    }>;
    notes?: string;
    isFavorite?: boolean;
    isDefault?: boolean;
  }>();

  if (!body.name || !body.promptBody) {
    return c.json({ error: 'name and promptBody are required' }, 400);
  }

  // If setting as default, unset other defaults first
  if (body.isDefault) {
    await db
      .update(promptTemplates)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(promptTemplates.userId, user.id), eq(promptTemplates.isDefault, true)));
  }

  const [template] = await db
    .insert(promptTemplates)
    .values({
      userId: user.id,
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      platforms: body.platforms || [],
      promptBody: body.promptBody,
      placeholders: body.placeholders || [],
      notes: body.notes || null,
      isFavorite: body.isFavorite ?? false,
      isDefault: body.isDefault ?? false,
    })
    .returning();

  return c.json({ template }, 201);
});

// Update prompt template
promptTemplateRoutes.put('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;
  const body = await c.req.json<{
    name?: string;
    description?: string | null;
    category?: string | null;
    platforms?: string[];
    promptBody?: string;
    placeholders?: Array<{
      key: string;
      label: string;
      description?: string;
      defaultValue?: string;
      required?: boolean;
    }>;
    notes?: string | null;
    isFavorite?: boolean;
    isDefault?: boolean;
  }>();

  // Verify ownership
  const [existing] = await db
    .select({ id: promptTemplates.id })
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Template not found' }, 404);
  }

  // If setting as default, unset other defaults first
  if (body.isDefault) {
    await db
      .update(promptTemplates)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(promptTemplates.userId, user.id), eq(promptTemplates.isDefault, true)));
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.platforms !== undefined) updateData.platforms = body.platforms;
  if (body.promptBody !== undefined) updateData.promptBody = body.promptBody;
  if (body.placeholders !== undefined) updateData.placeholders = body.placeholders;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.isFavorite !== undefined) updateData.isFavorite = body.isFavorite;
  if (body.isDefault !== undefined) updateData.isDefault = body.isDefault;

  const [updated] = await db
    .update(promptTemplates)
    .set(updateData)
    .where(eq(promptTemplates.id, id))
    .returning();

  return c.json({ template: updated });
});

// Toggle favorite
promptTemplateRoutes.post('/:id/favorite', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [existing] = await db
    .select()
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Template not found' }, 404);
  }

  const [updated] = await db
    .update(promptTemplates)
    .set({ isFavorite: !existing.isFavorite, updatedAt: new Date() })
    .where(eq(promptTemplates.id, id))
    .returning();

  return c.json({ template: updated });
});

// Set as default
promptTemplateRoutes.post('/:id/default', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [existing] = await db
    .select({ id: promptTemplates.id })
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Template not found' }, 404);
  }

  // Unset all defaults for this user
  await db
    .update(promptTemplates)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(promptTemplates.userId, user.id), eq(promptTemplates.isDefault, true)));

  // Set the selected one as default
  const [updated] = await db
    .update(promptTemplates)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(eq(promptTemplates.id, id))
    .returning();

  return c.json({ template: updated });
});

// Preview template with placeholder substitution
promptTemplateRoutes.post('/:id/preview', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;
  const body = await c.req.json<{ values?: Record<string, string> }>();

  const [template] = await db
    .select()
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.userId, user.id)))
    .limit(1);

  if (!template) {
    return c.json({ error: 'Template not found' }, 404);
  }

  const values = body.values || {};
  const preview = substitutePlaceholders(template.promptBody, values);

  return c.json({ preview, template });
});

// Delete prompt template
promptTemplateRoutes.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [existing] = await db
    .select({ id: promptTemplates.id })
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Template not found' }, 404);
  }

  await db.delete(promptTemplates).where(eq(promptTemplates.id, id));

  return c.json({ deleted: true });
});

// Get usage history for a template
promptTemplateRoutes.get('/:id/history', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  // Verify ownership
  const [existing] = await db
    .select({ id: promptTemplates.id })
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Template not found' }, 404);
  }

  const history = await db
    .select()
    .from(templateUsageHistory)
    .where(eq(templateUsageHistory.templateId, id))
    .orderBy(desc(templateUsageHistory.createdAt));

  return c.json({ history });
});

// Apply template to a project (Task 4 integration)
promptTemplateRoutes.post('/:id/apply', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;
  const body = await c.req.json<{
    projectId: string;
    values?: Record<string, string>;
  }>();

  if (!body.projectId) {
    return c.json({ error: 'projectId is required' }, 400);
  }

  const [template] = await db
    .select()
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.userId, user.id)))
    .limit(1);

  if (!template) {
    return c.json({ error: 'Template not found' }, 404);
  }

  const values = body.values || {};
  const substituted = substitutePlaceholders(template.promptBody, values);

  // Record usage
  await db.insert(templateUsageHistory).values({
    templateId: id,
    userId: user.id,
    projectId: body.projectId,
    substitutedValues: values,
  });

  // Increment usage count and update lastUsedAt
  await db
    .update(promptTemplates)
    .set({
      usageCount: sql`${promptTemplates.usageCount} + 1`,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(promptTemplates.id, id));

  return c.json({ prompt: substituted, templateId: id });
});

// Helper: substitute placeholders in template body
export function substitutePlaceholders(
  body: string,
  values: Record<string, string>
): string {
  return body.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });
}
