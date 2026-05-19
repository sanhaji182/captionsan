import { Hono } from 'hono';
import { db } from '@captionsan/db';
import { apiTokens } from '@captionsan/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import { generateApiToken, hashToken } from '../middleware/api-key.js';

export const apiTokenRoutes = new Hono();

// List user's API tokens (token value is never shown again after creation)
apiTokenRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };

  const tokens = await db
    .select({
      id: apiTokens.id,
      name: apiTokens.name,
      lastUsedAt: apiTokens.lastUsedAt,
      expiresAt: apiTokens.expiresAt,
      createdAt: apiTokens.createdAt,
    })
    .from(apiTokens)
    .where(eq(apiTokens.userId, user.id));

  return c.json({ tokens });
});

// Create API token
apiTokenRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const body = await c.req.json<{ name: string; expiresInDays?: number }>();

  if (!body.name) {
    return c.json({ error: 'name is required' }, 400);
  }

  const token = generateApiToken();
  const tokenHashValue = hashToken(token);

  const expiresAt = body.expiresInDays
    ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const [created] = await db
    .insert(apiTokens)
    .values({
      userId: user.id,
      name: body.name,
      tokenHash: tokenHashValue,
      expiresAt,
    })
    .returning({
      id: apiTokens.id,
      name: apiTokens.name,
      expiresAt: apiTokens.expiresAt,
      createdAt: apiTokens.createdAt,
    });

  // Return the token value only once at creation time
  return c.json({ token: { ...created, value: token } }, 201);
});

// Delete API token
apiTokenRoutes.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [existing] = await db
    .select({ id: apiTokens.id })
    .from(apiTokens)
    .where(and(eq(apiTokens.id, id), eq(apiTokens.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Token not found' }, 404);
  }

  await db.delete(apiTokens).where(eq(apiTokens.id, id));

  return c.json({ deleted: true });
});
