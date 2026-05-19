import { Hono } from 'hono';
import { db } from '@captionsan/db';
import {
  projects,
  providerConnections,
  generations,
  platformOutputs,
} from '@captionsan/db/schema';
import { eq, and } from 'drizzle-orm';
import { decrypt } from '../../lib/encryption.js';
import { AIClient, buildGenerationPrompt, PLATFORM_CONFIGS, ALL_PLATFORMS } from '../../lib/ai/index.js';
import type { Platform } from '../../lib/ai/index.js';

export const v1Generations = new Hono();

/**
 * POST /v1/generations
 * Generate platform-specific content for a project.
 *
 * Body: { projectId, platforms?, providerConnectionId? }
 * - platforms: array of platform keys. Defaults to all platforms.
 * - providerConnectionId: optional, uses default if not provided.
 *
 * Response: { generation: { id, status, outputs: [...] } }
 */
v1Generations.post('/', async (c) => {
  const user = c.get('user' as never) as { id: string };
  const body = await c.req.json<{
    projectId: string;
    platforms?: Platform[];
    providerConnectionId?: string;
  }>();

  if (!body.projectId) {
    return c.json({ error: 'projectId is required' }, 400);
  }

  const platforms = body.platforms && body.platforms.length > 0 ? body.platforms : ALL_PLATFORMS;

  // Validate platforms
  const validPlatforms = Object.keys(PLATFORM_CONFIGS);
  for (const p of platforms) {
    if (!validPlatforms.includes(p)) {
      return c.json({ error: `Invalid platform: ${p}` }, 400);
    }
  }

  // Verify project ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, body.projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Get provider connection
  let providerConnection;
  if (body.providerConnectionId) {
    [providerConnection] = await db
      .select()
      .from(providerConnections)
      .where(
        and(
          eq(providerConnections.id, body.providerConnectionId),
          eq(providerConnections.userId, user.id)
        )
      )
      .limit(1);
  } else {
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
    return c.json({ error: 'No provider connection found. Configure a provider first.' }, 400);
  }

  // Create generation record
  const [generation] = await db
    .insert(generations)
    .values({
      projectId: project.id,
      providerConnectionId: providerConnection.id,
      promptVersion: 'v1',
      generationStatus: 'processing',
    })
    .returning();

  // Update project status
  await db
    .update(projects)
    .set({ status: 'generating', updatedAt: new Date() })
    .where(eq(projects.id, project.id));

  // Initialize AI client
  const apiKey = decrypt(providerConnection.encryptedApiKey);
  const aiClient = new AIClient({
    baseUrl: providerConnection.baseUrl,
    model: providerConnection.model,
    apiKey,
  });

  // Generate for each platform
  const outputs: Array<{
    platform: Platform;
    content: string;
    characterCount: number;
  }> = [];
  const errors: Array<{ platform: Platform; error: string }> = [];

  for (const platform of platforms) {
    try {
      const messages = buildGenerationPrompt(
        {
          originalInput: project.originalInput,
          sourceType: project.sourceType as 'idea' | 'draft',
          additionalContext: project.additionalContext || undefined,
          platforms,
        },
        platform
      );

      const response = await aiClient.chatCompletion({ messages });
      const content = response.content.trim();

      outputs.push({ platform, content, characterCount: content.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      errors.push({ platform, error: message });
    }
  }

  // Store outputs
  let storedOutputs: Array<typeof platformOutputs.$inferSelect> = [];
  if (outputs.length > 0) {
    storedOutputs = await db
      .insert(platformOutputs)
      .values(
        outputs.map((output) => ({
          generationId: generation.id,
          platform: output.platform,
          tone: PLATFORM_CONFIGS[output.platform].tone,
          targetLength: PLATFORM_CONFIGS[output.platform].maxLength,
          characterCount: output.characterCount,
          contentOriginalAi: output.content,
          contentCurrent: output.content,
          approvalStatus: 'draft' as const,
        }))
      )
      .returning();
  }

  // Update generation status
  const finalStatus =
    errors.length === 0 ? 'completed' : outputs.length > 0 ? 'partial' : 'failed';
  await db
    .update(generations)
    .set({ generationStatus: finalStatus })
    .where(eq(generations.id, generation.id));

  // Update project status
  await db
    .update(projects)
    .set({ status: 'review', updatedAt: new Date() })
    .where(eq(projects.id, project.id));

  return c.json(
    {
      generation: {
        id: generation.id,
        status: finalStatus,
        outputs: storedOutputs.map((o) => ({
          id: o.id,
          platform: o.platform,
          characterCount: o.characterCount,
          content: o.contentCurrent,
          approvalStatus: o.approvalStatus,
        })),
        errors: errors.length > 0 ? errors : undefined,
      },
    },
    201
  );
});

/**
 * GET /v1/generations/:id
 * Get a generation with its outputs.
 *
 * Response: { generation, outputs }
 */
v1Generations.get('/:id', async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  const [generation] = await db
    .select()
    .from(generations)
    .where(eq(generations.id, id))
    .limit(1);

  if (!generation) {
    return c.json({ error: 'Generation not found' }, 404);
  }

  // Verify ownership
  const [project] = await db
    .select({ userId: projects.userId })
    .from(projects)
    .where(eq(projects.id, generation.projectId))
    .limit(1);

  if (!project || project.userId !== user.id) {
    return c.json({ error: 'Generation not found' }, 404);
  }

  const outputs = await db
    .select()
    .from(platformOutputs)
    .where(eq(platformOutputs.generationId, id));

  return c.json({
    generation,
    outputs: outputs.map((o) => ({
      id: o.id,
      platform: o.platform,
      tone: o.tone,
      characterCount: o.characterCount,
      contentOriginalAi: o.contentOriginalAi,
      contentCurrent: o.contentCurrent,
      approvalStatus: o.approvalStatus,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })),
  });
});
