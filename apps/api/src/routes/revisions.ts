import { Hono } from 'hono';
import { db } from '@captionsan/db';
import {
  projects,
  generations,
  platformOutputs,
  providerConnections,
  revisionMessages,
} from '@captionsan/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import { decrypt } from '../lib/encryption.js';
import { AIClient, buildRevisionPrompt } from '../lib/ai/index.js';
import type { Platform } from '../lib/ai/index.js';

export const revisionRoutes = new Hono();

// Revise a platform output with free-text instruction
revisionRoutes.post('/:outputId/revise', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const outputId = c.req.param('outputId')!;
  const body = await c.req.json<{ instruction: string }>();

  if (!body.instruction || body.instruction.trim().length === 0) {
    return c.json({ error: 'instruction is required' }, 400);
  }

  // Get the platform output
  const [output] = await db
    .select()
    .from(platformOutputs)
    .where(eq(platformOutputs.id, outputId))
    .limit(1);

  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  // Verify ownership through generation -> project
  const [generation] = await db
    .select()
    .from(generations)
    .where(eq(generations.id, output.generationId))
    .limit(1);

  if (!generation) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, generation.projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Output not found' }, 404);
  }

  // Get provider connection
  let providerConnection;
  if (generation.providerConnectionId) {
    [providerConnection] = await db
      .select()
      .from(providerConnections)
      .where(eq(providerConnections.id, generation.providerConnectionId))
      .limit(1);
  }

  if (!providerConnection) {
    // Fallback to user's default
    [providerConnection] = await db
      .select()
      .from(providerConnections)
      .where(
        and(
          eq(providerConnections.userId, user.id),
          eq(providerConnections.isDefault, true)
        )
      )
      .limit(1);
  }

  if (!providerConnection) {
    return c.json({ error: 'No provider connection available' }, 400);
  }

  // Build revision prompt
  const messages = buildRevisionPrompt(
    output.contentCurrent,
    body.instruction,
    output.platform as Platform
  );

  // Call AI
  const apiKey = decrypt(providerConnection.encryptedApiKey);
  const aiClient = new AIClient({
    baseUrl: providerConnection.baseUrl,
    model: providerConnection.model,
    apiKey,
  });

  try {
    const response = await aiClient.chatCompletion({ messages });
    const revisedContent = response.content.trim();

    // Save revision message
    await db.insert(revisionMessages).values({
      platformOutputId: output.id,
      actorType: 'ai',
      instructionText: body.instruction,
      resultingContent: revisedContent,
    });

    // Update current content
    await db
      .update(platformOutputs)
      .set({
        contentCurrent: revisedContent,
        characterCount: revisedContent.length,
        approvalStatus: 'draft',
        updatedAt: new Date(),
      })
      .where(eq(platformOutputs.id, output.id));

    return c.json({
      revised: true,
      content: revisedContent,
      characterCount: revisedContent.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Revision failed';
    return c.json({ error: message }, 500);
  }
});

// Manual edit (user edits content directly)
revisionRoutes.put('/:outputId/edit', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const outputId = c.req.param('outputId')!;
  const body = await c.req.json<{ content: string }>();

  if (!body.content) {
    return c.json({ error: 'content is required' }, 400);
  }

  // Get the platform output and verify ownership
  const [output] = await db
    .select()
    .from(platformOutputs)
    .where(eq(platformOutputs.id, outputId))
    .limit(1);

  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const [generation] = await db
    .select()
    .from(generations)
    .where(eq(generations.id, output.generationId))
    .limit(1);

  if (!generation) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, generation.projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Output not found' }, 404);
  }

  // Save revision message for manual edit
  await db.insert(revisionMessages).values({
    platformOutputId: output.id,
    actorType: 'user',
    instructionText: '[Manual edit]',
    resultingContent: body.content,
  });

  // Update current content
  await db
    .update(platformOutputs)
    .set({
      contentCurrent: body.content,
      characterCount: body.content.length,
      updatedAt: new Date(),
    })
    .where(eq(platformOutputs.id, output.id));

  return c.json({
    updated: true,
    content: body.content,
    characterCount: body.content.length,
  });
});

// Approve output
revisionRoutes.post('/:outputId/approve', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const outputId = c.req.param('outputId')!;

  // Get the platform output and verify ownership
  const [output] = await db
    .select()
    .from(platformOutputs)
    .where(eq(platformOutputs.id, outputId))
    .limit(1);

  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const [generation] = await db
    .select()
    .from(generations)
    .where(eq(generations.id, output.generationId))
    .limit(1);

  if (!generation) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, generation.projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Output not found' }, 404);
  }

  await db
    .update(platformOutputs)
    .set({ approvalStatus: 'approved', updatedAt: new Date() })
    .where(eq(platformOutputs.id, output.id));

  // Check if all outputs for this generation are approved
  const allOutputs = await db
    .select({ approvalStatus: platformOutputs.approvalStatus })
    .from(platformOutputs)
    .where(eq(platformOutputs.generationId, generation.id));

  const allApproved = allOutputs.every((o) => o.approvalStatus === 'approved');

  if (allApproved) {
    await db
      .update(projects)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(eq(projects.id, project.id));
  }

  return c.json({ approved: true, allApproved });
});

// Get revision history for an output
revisionRoutes.get('/:outputId/history', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const outputId = c.req.param('outputId')!;

  // Verify ownership
  const [output] = await db
    .select()
    .from(platformOutputs)
    .where(eq(platformOutputs.id, outputId))
    .limit(1);

  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const [generation] = await db
    .select()
    .from(generations)
    .where(eq(generations.id, output.generationId))
    .limit(1);

  if (!generation) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, generation.projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const history = await db
    .select()
    .from(revisionMessages)
    .where(eq(revisionMessages.platformOutputId, outputId))
    .orderBy(desc(revisionMessages.createdAt));

  return c.json({ history });
});
