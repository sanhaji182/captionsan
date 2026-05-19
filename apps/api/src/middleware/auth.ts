import type { Context, Next } from 'hono';
import { getSessionFromToken } from '../lib/auth.js';
import { getCookie } from 'hono/cookie';

export const requireAuth = async (c: Context, next: Next) => {
  // Try session token from cookie first, then Authorization header
  const cookieToken = getCookie(c, 'session_token');
  const authHeader = c.req.header('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const result = await getSessionFromToken(token);
  if (!result) {
    return c.json({ error: 'Session expired or invalid' }, 401);
  }

  c.set('user' as never, result.user as never);
  c.set('session' as never, result.session as never);
  await next();
};
