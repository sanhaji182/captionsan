import { hash, verify } from '@node-rs/argon2';
import { randomUUID } from 'crypto';
import { db } from '@captionsan/db';
import { users, sessions, accounts } from '@captionsan/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export async function verifyPassword(hashed: string, password: string): Promise<boolean> {
  return verify(hashed, password);
}

export async function createUser(data: { name: string; email: string; password: string; role?: string }) {
  const passwordHash = await hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      role: data.role || 'member',
      locale: 'id',
    })
    .returning();

  // Store password in accounts table
  await db.insert(accounts).values({
    userId: user.id,
    accountId: user.id,
    providerId: 'credential',
    password: passwordHash,
  });

  return user;
}

export async function authenticateUser(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return null;

  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, user.id), eq(accounts.providerId, 'credential')))
    .limit(1);

  if (!account?.password) return null;

  const valid = await verifyPassword(account.password, password);
  if (!valid) return null;

  return user;
}

export async function createSession(userId: string, headers?: { ip?: string; userAgent?: string }) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      token,
      expiresAt,
      ipAddress: headers?.ip || null,
      userAgent: headers?.userAgent || null,
    })
    .returning();

  return { session, token };
}

export async function getSessionFromToken(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!session) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) return null;

  return { session, user };
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}
