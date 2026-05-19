import { Hono } from 'hono';
import { db } from '@captionsan/db';
import { users, invitations } from '@captionsan/db/schema';
import { eq } from 'drizzle-orm';
import { createUser } from '../lib/auth.js';

export const setupRoutes = new Hono();

// One-time setup endpoint (only works if no admin exists)
setupRoutes.post('/', async (c) => {
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.role, 'admin'))
    .limit(1);

  if (existingAdmin) {
    return c.json({ error: 'Setup already completed. Admin exists.' }, 400);
  }

  const body = await c.req.json<{
    name?: string;
    email?: string;
    password?: string;
  }>();

  const name = body.name || 'Admin';
  const email = body.email || 'admin@captionsan.local';
  const password = body.password || 'admin123';

  try {
    const user = await createUser({ name, email, password, role: 'admin' });

    // Create a test invitation
    await db
      .insert(invitations)
      .values({
        email: 'user@captionsan.local',
        role: 'member',
        token: 'test-invite-token',
        invitedBy: user.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })
      .onConflictDoNothing();

    return c.json({
      success: true,
      admin: { email, name },
      login: { email, password },
      testInviteUrl: 'http://localhost:3000/invite/test-invite-token',
    }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Setup failed';
    return c.json({ error: message }, 500);
  }
});
