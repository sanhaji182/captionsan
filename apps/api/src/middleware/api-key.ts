import type { Context, Next } from 'hono';
import { createHash } from 'crypto';
import { db } from '@captionsan/db';
import { apiTokens, users } from '@captionsan/db/schema';
import { eq, and, gt, isNull, or } from 'drizzle-orm';

/**
 * Middleware that accepts either session auth or API key auth.
 * API keys are passed via Authorization: Bearer <token> header.
 * Session auth uses cookies (handled by Better Auth).
 */
export const requireApiAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  // Try API key auth first (Bearer token that starts with 'csan_')
  if (authHeader?.startsWith('Bearer csan_')) {
    const token = authHeader.slice(7); // Remove 'Bearer '
    const tokenHash = hashToken(token);

    const [apiToken] = await db
      .select({
        id: apiTokens.id,
        userId: apiTokens.userId,
        expiresAt: apiTokens.expiresAt,
      })
      .from(apiTokens)
      .where(
        and(
          eq(apiTokens.tokenHash, tokenHash),
          or(isNull(apiTokens.expiresAt), gt(apiTokens.expiresAt, new Date()))
        )
      )
      .limit(1);

    if (!apiToken) {
      return c.json({ error: 'Invalid or expired API token' }, 401);
    }

    // Get user
    const [user] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, apiToken.userId))
      .limit(1);

    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }

    // Update last used
    await db
      .update(apiTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiTokens.id, apiToken.id));

    c.set('user' as never, user as never);
    c.set('authMethod' as never, 'api_key' as never);
    await next();
    return;
  }

  // Fall back to session auth
  const { getSessionFromToken } = await import('../lib/auth.js');
  const { getCookie } = await import('hono/cookie');

  const cookieToken = getCookie(c, 'session_token');
  if (!cookieToken) {
    return c.json({ error: 'Unauthorized. Provide a valid session or API key.' }, 401);
  }

  const sessionResult = await getSessionFromToken(cookieToken);
  if (!sessionResult) {
    return c.json({ error: 'Session expired or invalid' }, 401);
  }

  c.set('user' as never, sessionResult.user as never);
  c.set('authMethod' as never, 'session' as never);
  await next();
};

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateApiToken(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `csan_${hex}`;
}
