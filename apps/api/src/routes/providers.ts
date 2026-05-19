import { Hono } from 'hono';
import { db } from '@captionsan/db';
import { providerConnections } from '@captionsan/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import { encrypt, decrypt } from '../lib/encryption.js';

export const providerRoutes = new Hono();

// List user's provider connections (keys are masked)
providerRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };

  const connections = await db
    .select({
      id: providerConnections.id,
      providerName: providerConnections.providerName,
      baseUrl: providerConnections.baseUrl,
      model: providerConnections.model,
      isDefault: providerConnections.isDefault,
      createdAt: providerConnections.createdAt,
      updatedAt: providerConnections.updatedAt,
    })
    .from(providerConnections)
    .where(eq(providerConnections.userId, user.id));

  return c.json({ connections });
});

// Get single provider connection (key masked)
providerRoutes.get('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [connection] = await db
    .select({
      id: providerConnections.id,
      providerName: providerConnections.providerName,
      baseUrl: providerConnections.baseUrl,
      model: providerConnections.model,
      isDefault: providerConnections.isDefault,
      createdAt: providerConnections.createdAt,
      updatedAt: providerConnections.updatedAt,
    })
    .from(providerConnections)
    .where(
      and(eq(providerConnections.id, id), eq(providerConnections.userId, user.id))
    )
    .limit(1);

  if (!connection) {
    return c.json({ error: 'Provider connection not found' }, 404);
  }

  return c.json({ connection });
});

// Create provider connection
providerRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const body = await c.req.json<{
    providerName: string;
    baseUrl: string;
    model: string;
    apiKey: string;
    isDefault?: boolean;
  }>();

  // Validate required fields
  if (!body.providerName || !body.baseUrl || !body.model || !body.apiKey) {
    return c.json(
      { error: 'providerName, baseUrl, model, and apiKey are required' },
      400
    );
  }

  // Validate URL format
  try {
    new URL(body.baseUrl);
  } catch {
    return c.json({ error: 'baseUrl must be a valid URL' }, 400);
  }

  const encryptedApiKey = encrypt(body.apiKey);

  // If setting as default, unset other defaults first
  if (body.isDefault) {
    await db
      .update(providerConnections)
      .set({ isDefault: false })
      .where(eq(providerConnections.userId, user.id));
  }

  const [connection] = await db
    .insert(providerConnections)
    .values({
      userId: user.id,
      providerName: body.providerName,
      baseUrl: body.baseUrl,
      model: body.model,
      encryptedApiKey,
      isDefault: body.isDefault ?? false,
    })
    .returning({
      id: providerConnections.id,
      providerName: providerConnections.providerName,
      baseUrl: providerConnections.baseUrl,
      model: providerConnections.model,
      isDefault: providerConnections.isDefault,
      createdAt: providerConnections.createdAt,
    });

  return c.json({ connection }, 201);
});

// Update provider connection
providerRoutes.put('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;
  const body = await c.req.json<{
    providerName?: string;
    baseUrl?: string;
    model?: string;
    apiKey?: string;
    isDefault?: boolean;
  }>();

  // Verify ownership
  const [existing] = await db
    .select({ id: providerConnections.id })
    .from(providerConnections)
    .where(
      and(eq(providerConnections.id, id), eq(providerConnections.userId, user.id))
    )
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Provider connection not found' }, 404);
  }

  // Validate URL if provided
  if (body.baseUrl) {
    try {
      new URL(body.baseUrl);
    } catch {
      return c.json({ error: 'baseUrl must be a valid URL' }, 400);
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (body.providerName) updateData.providerName = body.providerName;
  if (body.baseUrl) updateData.baseUrl = body.baseUrl;
  if (body.model) updateData.model = body.model;
  if (body.apiKey) updateData.encryptedApiKey = encrypt(body.apiKey);
  if (body.isDefault !== undefined) {
    if (body.isDefault) {
      // Unset other defaults
      await db
        .update(providerConnections)
        .set({ isDefault: false })
        .where(eq(providerConnections.userId, user.id));
    }
    updateData.isDefault = body.isDefault;
  }

  const [updated] = await db
    .update(providerConnections)
    .set(updateData)
    .where(eq(providerConnections.id, id))
    .returning({
      id: providerConnections.id,
      providerName: providerConnections.providerName,
      baseUrl: providerConnections.baseUrl,
      model: providerConnections.model,
      isDefault: providerConnections.isDefault,
      updatedAt: providerConnections.updatedAt,
    });

  return c.json({ connection: updated });
});

// Delete provider connection
providerRoutes.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [existing] = await db
    .select({ id: providerConnections.id })
    .from(providerConnections)
    .where(
      and(eq(providerConnections.id, id), eq(providerConnections.userId, user.id))
    )
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Provider connection not found' }, 404);
  }

  await db
    .delete(providerConnections)
    .where(eq(providerConnections.id, id));

  return c.json({ deleted: true });
});

// Test provider connection
providerRoutes.post('/:id/test', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [connection] = await db
    .select()
    .from(providerConnections)
    .where(
      and(eq(providerConnections.id, id), eq(providerConnections.userId, user.id))
    )
    .limit(1);

  if (!connection) {
    return c.json({ error: 'Provider connection not found' }, 404);
  }

  const apiKey = decrypt(connection.encryptedApiKey);

  try {
    // Test with a minimal OpenAI-compatible request (list models)
    const response = await fetch(`${connection.baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return c.json({ success: true, message: 'Connection successful' });
    }

    const errorBody = await response.text();
    return c.json(
      {
        success: false,
        message: `Provider returned ${response.status}`,
        detail: errorBody.slice(0, 200),
      },
      422
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json(
      { success: false, message: `Connection failed: ${message}` },
      422
    );
  }
});

// Test connection with inline credentials (before saving)
providerRoutes.post('/test-inline', requireAuth, async (c) => {
  const body = await c.req.json<{
    baseUrl: string;
    apiKey: string;
  }>();

  if (!body.baseUrl || !body.apiKey) {
    return c.json({ error: 'baseUrl and apiKey are required' }, 400);
  }

  try {
    new URL(body.baseUrl);
  } catch {
    return c.json({ error: 'baseUrl must be a valid URL' }, 400);
  }

  try {
    const response = await fetch(`${body.baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${body.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return c.json({ success: true, message: 'Connection successful' });
    }

    const errorBody = await response.text();
    return c.json(
      {
        success: false,
        message: `Provider returned ${response.status}`,
        detail: errorBody.slice(0, 200),
      },
      422
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json(
      { success: false, message: `Connection failed: ${message}` },
      422
    );
  }
});
