import { Hono } from 'hono';
import { db } from '@captionsan/db';
import { brandVoices } from '@captionsan/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

export const brandVoiceRoutes = new Hono();

// List user's brand voices
brandVoiceRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };

  const voices = await db
    .select()
    .from(brandVoices)
    .where(eq(brandVoices.userId, user.id))
    .orderBy(desc(brandVoices.createdAt));

  return c.json({ brandVoices: voices });
});

// Get single brand voice
brandVoiceRoutes.get('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [voice] = await db
    .select()
    .from(brandVoices)
    .where(and(eq(brandVoices.id, id), eq(brandVoices.userId, user.id)))
    .limit(1);

  if (!voice) {
    return c.json({ error: 'Brand voice not found' }, 404);
  }

  return c.json({ brandVoice: voice });
});

// Create brand voice
brandVoiceRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const body = await c.req.json<{
    name: string;
    tone: string;
    styleRules?: string;
    audience?: string;
    bannedWords?: string[];
    ctaPreferences?: string;
    languageStyle?: string;
    contentLengthGuidance?: string;
    isDefault?: boolean;
  }>();

  if (!body.name || !body.tone) {
    return c.json({ error: 'name and tone are required' }, 400);
  }

  // If setting as default, unset other defaults first
  if (body.isDefault) {
    await db
      .update(brandVoices)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(brandVoices.userId, user.id), eq(brandVoices.isDefault, true)));
  }

  const [voice] = await db
    .insert(brandVoices)
    .values({
      userId: user.id,
      name: body.name,
      tone: body.tone,
      styleRules: body.styleRules || null,
      audience: body.audience || null,
      bannedWords: body.bannedWords || [],
      ctaPreferences: body.ctaPreferences || null,
      languageStyle: body.languageStyle || null,
      contentLengthGuidance: body.contentLengthGuidance || null,
      isDefault: body.isDefault ?? false,
    })
    .returning();

  return c.json({ brandVoice: voice }, 201);
});

// Update brand voice
brandVoiceRoutes.put('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;
  const body = await c.req.json<{
    name?: string;
    tone?: string;
    styleRules?: string | null;
    audience?: string | null;
    bannedWords?: string[];
    ctaPreferences?: string | null;
    languageStyle?: string | null;
    contentLengthGuidance?: string | null;
    isDefault?: boolean;
  }>();

  // Verify ownership
  const [existing] = await db
    .select({ id: brandVoices.id })
    .from(brandVoices)
    .where(and(eq(brandVoices.id, id), eq(brandVoices.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Brand voice not found' }, 404);
  }

  // If setting as default, unset other defaults first
  if (body.isDefault) {
    await db
      .update(brandVoices)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(brandVoices.userId, user.id), eq(brandVoices.isDefault, true)));
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) updateData.name = body.name;
  if (body.tone !== undefined) updateData.tone = body.tone;
  if (body.styleRules !== undefined) updateData.styleRules = body.styleRules;
  if (body.audience !== undefined) updateData.audience = body.audience;
  if (body.bannedWords !== undefined) updateData.bannedWords = body.bannedWords;
  if (body.ctaPreferences !== undefined) updateData.ctaPreferences = body.ctaPreferences;
  if (body.languageStyle !== undefined) updateData.languageStyle = body.languageStyle;
  if (body.contentLengthGuidance !== undefined) updateData.contentLengthGuidance = body.contentLengthGuidance;
  if (body.isDefault !== undefined) updateData.isDefault = body.isDefault;

  const [updated] = await db
    .update(brandVoices)
    .set(updateData)
    .where(eq(brandVoices.id, id))
    .returning();

  return c.json({ brandVoice: updated });
});

// Set a brand voice as default
brandVoiceRoutes.post('/:id/default', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  // Verify ownership
  const [existing] = await db
    .select({ id: brandVoices.id })
    .from(brandVoices)
    .where(and(eq(brandVoices.id, id), eq(brandVoices.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Brand voice not found' }, 404);
  }

  // Unset all defaults for this user
  await db
    .update(brandVoices)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(brandVoices.userId, user.id), eq(brandVoices.isDefault, true)));

  // Set the selected one as default
  const [updated] = await db
    .update(brandVoices)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(eq(brandVoices.id, id))
    .returning();

  return c.json({ brandVoice: updated });
});

// Delete brand voice
brandVoiceRoutes.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [existing] = await db
    .select({ id: brandVoices.id })
    .from(brandVoices)
    .where(and(eq(brandVoices.id, id), eq(brandVoices.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Brand voice not found' }, 404);
  }

  await db.delete(brandVoices).where(eq(brandVoices.id, id));

  return c.json({ deleted: true });
});

// Get user's default brand voice
brandVoiceRoutes.get('/default/active', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };

  const [voice] = await db
    .select()
    .from(brandVoices)
    .where(and(eq(brandVoices.userId, user.id), eq(brandVoices.isDefault, true)))
    .limit(1);

  if (!voice) {
    return c.json({ brandVoice: null });
  }

  return c.json({ brandVoice: voice });
});
