import { describe, it, expect } from 'vitest';
import { buildGenerationPrompt } from '../prompt-builder.js';
import type { GenerationInput, Platform } from '../types.js';

describe('buildGenerationPrompt', () => {
  const baseInput: GenerationInput = {
    originalInput: 'Launch a new artisan coffee brand in Jakarta',
    sourceType: 'idea',
    platforms: ['instagram_feed', 'linkedin'],
  };

  it('uses approvedPrompt when provided (section header: "Writing Instruction (Approved Prompt)")', () => {
    const input: GenerationInput = {
      ...baseInput,
      approvedPrompt: 'Write about the launch of an artisan coffee brand targeting young professionals',
    };

    const messages = buildGenerationPrompt(input, 'instagram_feed');
    const userContent = messages[1].content;

    expect(userContent).toContain('## Writing Instruction (Approved Prompt)');
    expect(userContent).toContain(input.approvedPrompt);
    // Should NOT contain the raw source section when approvedPrompt is present
    expect(userContent).not.toContain('## Source');
  });

  it('falls back to originalInput when no approvedPrompt (section header: "Source")', () => {
    const messages = buildGenerationPrompt(baseInput, 'instagram_feed');
    const userContent = messages[1].content;

    expect(userContent).toContain('## Source');
    expect(userContent).toContain(baseInput.originalInput);
    expect(userContent).not.toContain('## Writing Instruction (Approved Prompt)');
  });

  it('includes platform requirements', () => {
    const messages = buildGenerationPrompt(baseInput, 'instagram_feed');
    const userContent = messages[1].content;

    expect(userContent).toContain('## Platform Requirements');
    expect(userContent).toContain('Instagram Feed');
    expect(userContent).toContain('engaging, conversational, with strong hook');
    expect(userContent).toContain('2200');
  });

  it('includes platform requirements for linkedin', () => {
    const messages = buildGenerationPrompt(baseInput, 'linkedin');
    const userContent = messages[1].content;

    expect(userContent).toContain('## Platform Requirements');
    expect(userContent).toContain('LinkedIn');
    expect(userContent).toContain('professional, insight-driven');
    expect(userContent).toContain('3000');
  });

  it('includes additional context when provided', () => {
    const input: GenerationInput = {
      ...baseInput,
      additionalContext: 'Focus on sustainability and local sourcing',
    };

    const messages = buildGenerationPrompt(input, 'instagram_feed');
    const userContent = messages[1].content;

    expect(userContent).toContain('## Additional Context');
    expect(userContent).toContain('Focus on sustainability and local sourcing');
  });

  it('does not include additional context section when not provided', () => {
    const messages = buildGenerationPrompt(baseInput, 'instagram_feed');
    const userContent = messages[1].content;

    expect(userContent).not.toContain('## Additional Context');
  });

  it('returns system message with CaptionSan identity', () => {
    const messages = buildGenerationPrompt(baseInput, 'instagram_feed');

    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('CaptionSan');
  });
});
