import { Hono } from 'hono';
import { db } from '@captionsan/db';
import { invitations } from '@captionsan/db/schema';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/auth.js';

export const invitationRoutes = new Hono();

// Create invitation (admin only)
invitationRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string; role: string };

  if (user.role !== 'admin') {
    return c.json({ error: 'Only admins can create invitations' }, 403);
  }

  const body = await c.req.json<{ email: string; role?: string }>();

  if (!body.email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [invitation] = await db
    .insert(invitations)
    .values({
      email: body.email,
      role: body.role || 'member',
      token,
      invitedBy: user.id,
      expiresAt,
    })
    .returning();

  return c.json({ invitation }, 201);
});

// Validate invitation token
invitationRoutes.get('/validate/:token', async (c) => {
  const token = c.req.param('token');

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.token, token),
        isNull(invitations.acceptedAt),
        gt(invitations.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!invitation) {
    return c.json({ valid: false, error: 'Invalid or expired invitation' }, 404);
  }

  return c.json({ valid: true, email: invitation.email, role: invitation.role });
});

// Accept invitation
invitationRoutes.post('/accept/:token', async (c) => {
  const token = c.req.param('token');

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.token, token),
        isNull(invitations.acceptedAt),
        gt(invitations.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!invitation) {
    return c.json({ error: 'Invalid or expired invitation' }, 404);
  }

  await db
    .update(invitations)
    .set({ acceptedAt: new Date() })
    .where(eq(invitations.id, invitation.id));

  return c.json({ accepted: true, email: invitation.email, role: invitation.role });
});
