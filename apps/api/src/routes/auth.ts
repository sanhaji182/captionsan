import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { createUser, authenticateUser, createSession, deleteSession } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { db } from '@captionsan/db';
import { users } from '@captionsan/db/schema';
import { eq } from 'drizzle-orm';

export const authRoutes = new Hono();

// Sign up
authRoutes.post('/sign-up/email', async (c) => {
  const body = await c.req.json<{ name: string; email: string; password: string }>();

  if (!body.name || !body.email || !body.password) {
    return c.json({ error: 'name, email, and password are required' }, 400);
  }

  if (body.password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400);
  }

  // Check if user already exists
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1);

  if (existing) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  try {
    const user = await createUser(body);
    const { token } = await createSession(user.id, {
      ip: c.req.header('x-forwarded-for') || undefined,
      userAgent: c.req.header('user-agent') || undefined,
    });

    setCookie(c, 'session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return c.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign-up failed';
    return c.json({ error: message }, 500);
  }
});

// Sign in
authRoutes.post('/sign-in/email', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();

  if (!body.email || !body.password) {
    return c.json({ error: 'email and password are required' }, 400);
  }

  const user = await authenticateUser(body.email, body.password);
  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const { token } = await createSession(user.id, {
    ip: c.req.header('x-forwarded-for') || undefined,
    userAgent: c.req.header('user-agent') || undefined,
  });

  setCookie(c, 'session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return c.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Sign out
authRoutes.post('/sign-out', requireAuth, async (c) => {
  const session = c.get('session' as never) as { token: string };
  await deleteSession(session.token);
  deleteCookie(c, 'session_token');
  return c.json({ success: true });
});

// Get current session
authRoutes.get('/get-session', async (c) => {
  const { getSessionFromToken } = await import('../lib/auth.js');
  const { getCookie } = await import('hono/cookie');

  const cookieToken = getCookie(c, 'session_token');
  const authHeader = c.req.header('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    return c.json({ session: null, user: null });
  }

  const result = await getSessionFromToken(token);
  if (!result) {
    return c.json({ session: null, user: null });
  }

  return c.json({
    session: { id: result.session.id, expiresAt: result.session.expiresAt },
    user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role },
  });
});
