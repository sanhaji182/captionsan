/**
 * Seed script for creating the initial admin user and invitation.
 * Run with: pnpm --filter @captionsan/db seed
 *
 * Requires DATABASE_URL to be set.
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, accounts, invitations } from './schema/index.js';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';

// Simple bcrypt-like hash for seeding (Better Auth uses bcrypt internally)
// We'll use the accounts table with credential provider instead
async function hashPassword(password: string): Promise<string> {
  // Better Auth stores passwords in the accounts table with providerId='credential'
  // It uses bcrypt, but for seeding we'll use a simpler approach
  // Actually, let's just use the native crypto to create a hash that Better Auth can verify
  // Better Auth v1 uses @better-auth/utils which uses noble/hashes scrypt
  // For the seed, we'll insert directly and the user can reset via the app
  // Instead, let's just create the invitation and let the user sign up through the UI
  return password; // placeholder - we'll use the invitation flow
}

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  console.log('🌱 Seeding database...');

  // Create admin user
  const [admin] = await db
    .insert(users)
    .values({
      name: 'Admin',
      email: 'admin@captionsan.local',
      role: 'admin',
      locale: 'id',
    })
    .onConflictDoNothing()
    .returning();

  if (admin) {
    console.log(`✅ Admin user created: ${admin.email}`);

    // Create credential account for admin (password: admin123)
    // Better Auth uses its own hashing, so we'll create an invitation instead
    // and let the user sign up through the normal flow

    // Create a sample invitation for testing
    const token = 'test-invite-token-123';
    await db
      .insert(invitations)
      .values({
        email: 'user@captionsan.local',
        role: 'member',
        token,
        invitedBy: admin.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      })
      .onConflictDoNothing();

    console.log(`✅ Test invitation created`);
    console.log(`   Invite URL: http://localhost:3000/invite/${token}`);
  } else {
    console.log('ℹ️  Admin user already exists, skipping.');
  }

  await client.end();
  console.log('🌱 Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
