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
import { decrypt } from '../../lib/encryption.js';
import { AIClient, buildRevisionPrompt } from '../../lib/ai/index.js';
import type { Platform } from '../../lib/ai/index.js';

export const v1Outputs = new Hono();

/**
 * POST /v1/outputs/:id/revise
 * Revise a platform output using free-text instruction.
 *
 * Body: { instruction: string }
 * Response: { output: { id, content, characterCount, approvalStatus } }
 */
v1Outputs.post('/:id/revise', async (c) => {
  const user = c.get('user' as never) as { id: string };
  const outputId = c.req.param('id')!;
  const body = await c.req.json<{ instruction: string }>();

  if (!body.instruction || body.instruction.trim().length === 0) {
    return c.json({ error: 'instruction is required' }, 400);
  }

  // Get output and verify ownership
  const output = await getOutputWithOwnershipCheck(outputId, user.id);
  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  // Get provider
  const providerConnection = await getProviderForOutput(output, user.id);
  if (!providerConnection) {
    return c.json({ error: 'No provider connection available' }, 400);
  }

  // Build revision prompt and call AI
  const messages = buildRevisionPrompt(
    output.contentCurrent,
    body.instruction,
    output.platform as Platform
  );

  const apiKey = decrypt(providerConnection.encryptedApiKey);
  const aiClient = new AIClient({
    baseUrl: providerConnection.baseUrl,
    model: providerConnection.model,
    apiKey,
  });

  try {
    const response = await aiClient.chatCompletion({ messages });
    const revisedContent = response.content.trim();

    // Save revision
    await db.insert(revisionMessages).values({
      platformOutputId: output.id,
      actorType: 'ai',
      instructionText: body.instruction,
      resultingContent: revisedContent,
    });

    // Update output
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
      output: {
        id: output.id,
        platform: output.platform,
        content: revisedContent,
        characterCount: revisedContent.length,
        approvalStatus: 'draft',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Revision failed';
    return c.json({ error: message }, 500);
  }
});

/**
 * PUT /v1/outputs/:id
 * Manually update the content of a platform output.
 *
 * Body: { content: string }
 * Response: { output: { id, content, characterCount, approvalStatus } }
 */
v1Outputs.put('/:id', async (c) => {
  const user = c.get('user' as never) as { id: string };
  const outputId = c.req.param('id')!;
  const body = await c.req.json<{ content: string }>();

  if (!body.content) {
    return c.json({ error: 'content is required' }, 400);
  }

  const output = await getOutputWithOwnershipCheck(outputId, user.id);
  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  // Save revision record
  await db.insert(revisionMessages).values({
    platformOutputId: output.id,
    actorType: 'user',
    instructionText: '[Manual edit via API]',
    resultingContent: body.content,
  });

  // Update output
  await db
    .update(platformOutputs)
    .set({
      contentCurrent: body.content,
      characterCount: body.content.length,
      updatedAt: new Date(),
    })
    .where(eq(platformOutputs.id, output.id));

  return c.json({
    output: {
      id: output.id,
      platform: output.platform,
      content: body.content,
      characterCount: body.content.length,
      approvalStatus: output.approvalStatus,
    },
  });
});

/**
 * POST /v1/outputs/:id/approve
 * Approve a platform output.
 *
 * Response: { output: { id, approvalStatus }, allApproved }
 */
v1Outputs.post('/:id/approve', async (c) => {
  const user = c.get('user' as never) as { id: string };
  const outputId = c.req.param('id')!;

  const output = await getOutputWithOwnershipCheck(outputId, user.id);
  if (!output) {
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
    .where(eq(platformOutputs.generationId, output.generationId));

  const allApproved = allOutputs.every(
    (o) => o.approvalStatus === 'approved'
  );

  if (allApproved) {
    const [gen] = await db
      .select({ projectId: generations.projectId })
      .from(generations)
      .where(eq(generations.id, output.generationId))
      .limit(1);

    if (gen) {
      await db
        .update(projects)
        .set({ status: 'approved', updatedAt: new Date() })
        .where(eq(projects.id, gen.projectId));
    }
  }

  return c.json({
    output: { id: output.id, approvalStatus: 'approved' },
    allApproved,
  });
});

/**
 * GET /v1/outputs/:id/history
 * Get revision history for a platform output.
 *
 * Response: { history: RevisionMessage[] }
 */
v1Outputs.get('/:id/history', async (c) => {
  const user = c.get('user' as never) as { id: string };
  const outputId = c.req.param('id')!;

  const output = await getOutputWithOwnershipCheck(outputId, user.id);
  if (!output) {
    return c.json({ error: 'Output not found' }, 404);
  }

  const history = await db
    .select()
    .from(revisionMessages)
    .where(eq(revisionMessages.platformOutputId, outputId))
    .orderBy(desc(revisionMessages.createdAt));

  return c.json({
    history: history.map((r) => ({
      id: r.id,
      actorType: r.actorType,
      instructionText: r.instructionText,
      resultingContent: r.resultingContent,
      createdAt: r.createdAt,
    })),
  });
});

// --- Helpers ---

async function getOutputWithOwnershipCheck(outputId: string, userId: string) {
  const [output] = await db
    .select()
    .from(platformOutputs)
    .where(eq(platformOutputs.id, outputId))
    .limit(1);

  if (!output) return null;

  const [generation] = await db
    .select()
    .from(generations)
    .where(eq(generations.id, output.generationId))
    .limit(1);

  if (!generation) return null;

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, generation.projectId), eq(projects.userId, userId)))
    .limit(1);

  if (!project) return null;

  return output;
}

async function getProviderForOutput(
  output: typeof platformOutputs.$inferSelect,
  userId: string
) {
  const [generation] = await db
    .select()
    .from(generations)
    .where(eq(generations.id, output.generationId))
    .limit(1);

  if (generation?.providerConnectionId) {
    const [conn] = await db
      .select()
      .from(providerConnections)
      .where(eq(providerConnections.id, generation.providerConnectionId))
      .limit(1);
    if (conn) return conn;
  }

  // Fallback to user's default
  const [conn] = await db
    .select()
    .from(providerConnections)
    .where(
      and(eq(providerConnections.userId, userId), eq(providerConnections.isDefault, true))
    )
    .limit(1);

  return conn || null;
}
