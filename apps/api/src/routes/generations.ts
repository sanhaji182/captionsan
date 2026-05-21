import { Hono } from 'hono';
import { db } from '@captionsan/db';
import {
  projects,
  providerConnections,
  generations,
  platformOutputs,
  promptDrafts,
  brandVoices,
} from '@captionsan/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import { decrypt } from '../lib/encryption.js';
import { AIClient, buildGenerationPrompt, PLATFORM_CONFIGS } from '../lib/ai/index.js';
import type { Platform } from '../lib/ai/index.js';
import type { BrandVoiceInput } from '../lib/ai/prompt-generator.js';
import { recordContentSnapshot } from './version-history.js';

export const generationRoutes = new Hono();

// Generate outputs for a project
generationRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const body = await c.req.json<{
    projectId: string;
    platforms: Platform[];
    providerConnectionId?: string;
  }>();

  if (!body.projectId || !body.platforms || body.platforms.length === 0) {
    return c.json({ error: 'projectId and platforms are required' }, 400);
  }

  // Validate platforms
  const validPlatforms = Object.keys(PLATFORM_CONFIGS);
  for (const p of body.platforms) {
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

  // Check for an approved prompt draft
  const [approvedPromptDraft] = await db
    .select()
    .from(promptDrafts)
    .where(
      and(
        eq(promptDrafts.projectId, body.projectId),
        eq(promptDrafts.promptApproved, true)
      )
    )
    .orderBy(desc(promptDrafts.createdAt))
    .limit(1);

  if (!approvedPromptDraft) {
    return c.json(
      { error: 'Prompt must be approved before generating content' },
      400
    );
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
    // Use default provider
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
    return c.json(
      { error: 'No provider connection found. Please configure a provider first.' },
      400
    );
  }

  // Create generation record
  const [generation] = await db
    .insert(generations)
    .values({
      projectId: project.id,
      promptDraftId: approvedPromptDraft.id,
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

  // Fetch user's default brand voice (if any)
  const [defaultBrandVoice] = await db
    .select()
    .from(brandVoices)
    .where(
      and(
        eq(brandVoices.userId, user.id),
        eq(brandVoices.isDefault, true)
      )
    )
    .limit(1);

  const brandVoiceInput: BrandVoiceInput | undefined = defaultBrandVoice
    ? {
        name: defaultBrandVoice.name,
        tone: defaultBrandVoice.tone,
        styleRules: defaultBrandVoice.styleRules,
        audience: defaultBrandVoice.audience,
        bannedWords: (defaultBrandVoice.bannedWords as string[]) || [],
        ctaPreferences: defaultBrandVoice.ctaPreferences,
        languageStyle: defaultBrandVoice.languageStyle,
        contentLengthGuidance: defaultBrandVoice.contentLengthGuidance,
      }
    : undefined;

  // Generate for each platform
  const outputs: Array<{
    platform: Platform;
    content: string;
    characterCount: number;
  }> = [];
  const errors: Array<{ platform: Platform; error: string }> = [];

  for (const platform of body.platforms) {
    try {
      const messages = buildGenerationPrompt(
        {
          originalInput: project.originalInput,
          sourceType: project.sourceType as 'idea' | 'draft',
          additionalContext: project.additionalContext || undefined,
          platforms: body.platforms,
          approvedPrompt: approvedPromptDraft.promptCurrent,
          brandVoice: brandVoiceInput,
        },
        platform
      );

      const response = await aiClient.chatCompletion({ messages });
      const content = response.content.trim();

      outputs.push({
        platform,
        content,
        characterCount: content.length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      errors.push({ platform, error: message });
    }
  }

  // Store outputs
  if (outputs.length > 0) {
    const insertedOutputs = await db.insert(platformOutputs).values(
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
    ).returning();

    // Record initial content version snapshots
    for (const inserted of insertedOutputs) {
      await recordContentSnapshot({
        outputId: inserted.id,
        projectId: project.id,
        content: inserted.contentOriginalAi,
        actorType: 'ai',
        label: 'Konten AI Original',
        status: 'draft',
        platform: inserted.platform,
      });
    }
  }

  // Update generation status
  const finalStatus = errors.length === 0 ? 'completed' : outputs.length > 0 ? 'partial' : 'failed';
  await db
    .update(generations)
    .set({ generationStatus: finalStatus })
    .where(eq(generations.id, generation.id));

  // Update project status
  await db
    .update(projects)
    .set({ status: 'content_review', updatedAt: new Date() })
    .where(eq(projects.id, project.id));

  return c.json({
    generation: {
      id: generation.id,
      status: finalStatus,
      outputCount: outputs.length,
      errors: errors.length > 0 ? errors : undefined,
    },
  }, 201);
});

// Get generation with outputs
generationRoutes.get('/:id', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const id = c.req.param('id')!;

  // Get generation and verify ownership through project
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

  // Get outputs
  const outputs = await db
    .select()
    .from(platformOutputs)
    .where(eq(platformOutputs.generationId, id));

  return c.json({ generation, outputs });
});

// Get outputs for a project (latest generation)
generationRoutes.get('/project/:projectId', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const projectId = c.req.param('projectId')!;

  // Verify project ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Get latest generation
  const projectGenerations = await db
    .select()
    .from(generations)
    .where(eq(generations.projectId, projectId))
    .orderBy(generations.createdAt);

  if (projectGenerations.length === 0) {
    return c.json({ generations: [], outputs: [] });
  }

  const latestGeneration = projectGenerations[projectGenerations.length - 1];

  // Get outputs for latest generation
  const outputs = await db
    .select()
    .from(platformOutputs)
    .where(eq(platformOutputs.generationId, latestGeneration.id));

  return c.json({
    generations: projectGenerations,
    outputs,
    latestGenerationId: latestGeneration.id,
  });
});
