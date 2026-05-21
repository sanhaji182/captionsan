import { Hono } from 'hono';
import { db } from '@captionsan/db';
import { projects, providerConnections, promptDrafts, promptRevisions, brandVoices } from '@captionsan/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import { decrypt } from '../lib/encryption.js';
import { generatePromptDraft, revisePromptDraft } from '../lib/ai/prompt-generator.js';
import type { BrandVoiceInput } from '../lib/ai/prompt-generator.js';
import { recordPromptSnapshot } from './version-history.js';

export const promptRoutes = new Hono();

// Generate a prompt draft for a project
promptRoutes.post('/:projectId/prompt/generate', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const projectId = c.req.param('projectId')!;

  // Verify project exists and belongs to the authenticated user
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Get the user's default provider connection
  const [providerConnection] = await db
    .select()
    .from(providerConnections)
    .where(
      and(
        eq(providerConnections.userId, user.id),
        eq(providerConnections.isDefault, true)
      )
    )
    .limit(1);

  if (!providerConnection) {
    return c.json(
      { error: 'No provider connection found. Please configure a provider first.' },
      400
    );
  }

  // Generate the prompt draft using AI
  const apiKey = decrypt(providerConnection.encryptedApiKey);
  let generatedPrompt: string;

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

  try {
    generatedPrompt = await generatePromptDraft(
      {
        originalInput: project.originalInput,
        additionalContext: project.additionalContext || undefined,
        sourceLanguage: project.sourceLanguage,
        brandVoice: brandVoiceInput,
      },
      {
        baseUrl: providerConnection.baseUrl,
        model: providerConnection.model,
        apiKey,
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Prompt generation failed';
    return c.json({ error: message }, 500);
  }

  // Store the result in prompt_drafts table
  const [promptDraft] = await db
    .insert(promptDrafts)
    .values({
      projectId: project.id,
      promptOriginal: generatedPrompt,
      promptCurrent: generatedPrompt,
      promptApproved: false,
      promptStatus: 'draft',
    })
    .returning();

  // Record version snapshot
  await recordPromptSnapshot({
    promptDraftId: promptDraft.id,
    projectId: project.id,
    content: generatedPrompt,
    actorType: 'ai',
    label: 'Prompt AI Original',
    status: 'draft',
  });

  // Update project status to prompt_review
  await db
    .update(projects)
    .set({ status: 'prompt_review', updatedAt: new Date() })
    .where(eq(projects.id, project.id));

  return c.json({ promptDraft }, 201);
});

// Edit the prompt draft manually
promptRoutes.put('/:projectId/prompt/edit', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const projectId = c.req.param('projectId')!;
  const body = await c.req.json<{ promptText: string }>();

  if (!body.promptText || body.promptText.trim().length === 0) {
    return c.json({ error: 'promptText is required' }, 400);
  }

  // Verify project exists and belongs to the authenticated user
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Find the latest prompt draft for this project
  const [promptDraft] = await db
    .select()
    .from(promptDrafts)
    .where(eq(promptDrafts.projectId, projectId))
    .orderBy(desc(promptDrafts.createdAt))
    .limit(1);

  if (!promptDraft) {
    return c.json({ error: 'No prompt draft found for this project' }, 404);
  }

  // Reject if prompt is already approved
  if (promptDraft.promptApproved) {
    return c.json({ error: 'Cannot edit an approved prompt' }, 400);
  }

  // Update prompt_current on the prompt draft
  const [updatedDraft] = await db
    .update(promptDrafts)
    .set({ promptCurrent: body.promptText.trim(), updatedAt: new Date() })
    .where(eq(promptDrafts.id, promptDraft.id))
    .returning();

  // Record version snapshot for manual edit
  await recordPromptSnapshot({
    promptDraftId: promptDraft.id,
    projectId,
    content: body.promptText.trim(),
    actorType: 'user',
    label: 'Edit Manual',
    status: promptDraft.promptStatus,
  });

  return c.json({ promptDraft: updatedDraft });
});

// Revise the prompt draft using AI
promptRoutes.post('/:projectId/prompt/revise', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const projectId = c.req.param('projectId')!;
  const body = await c.req.json<{ instruction: string }>();

  if (!body.instruction || body.instruction.trim().length === 0) {
    return c.json({ error: 'instruction is required' }, 400);
  }

  // Verify project exists and belongs to the authenticated user
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Find the latest prompt draft for this project
  const [promptDraft] = await db
    .select()
    .from(promptDrafts)
    .where(eq(promptDrafts.projectId, projectId))
    .orderBy(desc(promptDrafts.createdAt))
    .limit(1);

  if (!promptDraft) {
    return c.json({ error: 'No prompt draft found for this project' }, 404);
  }

  // Reject if prompt is already approved
  if (promptDraft.promptApproved) {
    return c.json({ error: 'Cannot revise an approved prompt' }, 400);
  }

  // Get the user's default provider connection
  const [providerConnection] = await db
    .select()
    .from(providerConnections)
    .where(
      and(
        eq(providerConnections.userId, user.id),
        eq(providerConnections.isDefault, true)
      )
    )
    .limit(1);

  if (!providerConnection) {
    return c.json(
      { error: 'No provider connection found. Please configure a provider first.' },
      400
    );
  }

  // Call AI to revise the prompt
  const apiKey = decrypt(providerConnection.encryptedApiKey);
  const revisedPrompt = await revisePromptDraft(
    promptDraft.promptCurrent,
    body.instruction.trim(),
    {
      baseUrl: providerConnection.baseUrl,
      model: providerConnection.model,
      apiKey,
    }
  );

  // Store the revision in prompt_revisions table
  const [revision] = await db
    .insert(promptRevisions)
    .values({
      promptDraftId: promptDraft.id,
      actorType: 'ai',
      instructionText: body.instruction.trim(),
      resultingPrompt: revisedPrompt,
    })
    .returning();

  // Update prompt_current on the prompt draft
  const [updatedDraft] = await db
    .update(promptDrafts)
    .set({ promptCurrent: revisedPrompt, updatedAt: new Date() })
    .where(eq(promptDrafts.id, promptDraft.id))
    .returning();

  // Record version snapshot for AI revision
  await recordPromptSnapshot({
    promptDraftId: promptDraft.id,
    projectId,
    content: revisedPrompt,
    actorType: 'ai',
    label: 'Revisi AI',
    status: promptDraft.promptStatus,
    metadata: { instructionText: body.instruction.trim() },
  });

  return c.json({ promptDraft: updatedDraft, revision });
});

// Approve the prompt draft
promptRoutes.post('/:projectId/prompt/approve', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const projectId = c.req.param('projectId')!;

  // Verify project exists and belongs to the authenticated user
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Find the latest prompt draft for this project
  const [promptDraft] = await db
    .select()
    .from(promptDrafts)
    .where(eq(promptDrafts.projectId, projectId))
    .orderBy(desc(promptDrafts.createdAt))
    .limit(1);

  if (!promptDraft) {
    return c.json({ error: 'No prompt draft found for this project' }, 404);
  }

  // Set prompt_approved = true and prompt_status = 'approved'
  const [updatedDraft] = await db
    .update(promptDrafts)
    .set({
      promptApproved: true,
      promptStatus: 'approved',
      updatedAt: new Date(),
    })
    .where(eq(promptDrafts.id, promptDraft.id))
    .returning();

  // Update project status to prompt_approved
  await db
    .update(projects)
    .set({ status: 'prompt_approved', updatedAt: new Date() })
    .where(eq(projects.id, project.id));

  return c.json({ promptDraft: updatedDraft });
});

// Apply a template as a prompt draft (no AI generation needed)
promptRoutes.post('/:projectId/prompt/apply-template', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const projectId = c.req.param('projectId')!;
  const body = await c.req.json<{ promptText: string }>();

  if (!body.promptText || body.promptText.trim().length === 0) {
    return c.json({ error: 'promptText is required' }, 400);
  }

  // Verify project exists and belongs to the authenticated user
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Store the template text as a prompt draft
  const [promptDraft] = await db
    .insert(promptDrafts)
    .values({
      projectId: project.id,
      promptOriginal: body.promptText.trim(),
      promptCurrent: body.promptText.trim(),
      promptApproved: false,
      promptStatus: 'draft',
    })
    .returning();

  // Record version snapshot for template application
  await recordPromptSnapshot({
    promptDraftId: promptDraft.id,
    projectId: project.id,
    content: body.promptText.trim(),
    actorType: 'template',
    label: 'Dari Template',
    status: 'draft',
  });

  // Update project status to prompt_review
  await db
    .update(projects)
    .set({ status: 'prompt_review', updatedAt: new Date() })
    .where(eq(projects.id, project.id));

  return c.json({ promptDraft }, 201);
});

// Get the latest prompt draft with revisions
promptRoutes.get('/:projectId/prompt', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: string };
  const projectId = c.req.param('projectId')!;

  // Verify project exists and belongs to the authenticated user
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  // Find the latest prompt draft for this project
  const [promptDraft] = await db
    .select()
    .from(promptDrafts)
    .where(eq(promptDrafts.projectId, projectId))
    .orderBy(desc(promptDrafts.createdAt))
    .limit(1);

  if (!promptDraft) {
    return c.json({ error: 'No prompt draft found for this project' }, 404);
  }

  // Get all revisions for this prompt draft
  const revisions = await db
    .select()
    .from(promptRevisions)
    .where(eq(promptRevisions.promptDraftId, promptDraft.id))
    .orderBy(desc(promptRevisions.createdAt));

  return c.json({ promptDraft, revisions });
});
