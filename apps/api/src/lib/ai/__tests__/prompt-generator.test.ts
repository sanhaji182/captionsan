import { describe, it, expect } from 'vitest';
import {
  buildPromptGenerationMessages,
  buildPromptRevisionMessages,
} from '../prompt-generator.js';

describe('buildPromptGenerationMessages', () => {
  it('returns correct message structure with system and user roles', () => {
    const messages = buildPromptGenerationMessages({
      originalInput: 'Launch a new coffee brand',
      sourceLanguage: 'en',
    });

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
    expect(messages[0].content).toContain('prompt engineer');
    expect(messages[1].content).toContain('Launch a new coffee brand');
  });

  it('includes additional context when provided', () => {
    const messages = buildPromptGenerationMessages({
      originalInput: 'Launch a new coffee brand',
      additionalContext: 'Target audience is millennials in Jakarta',
      sourceLanguage: 'en',
    });

    expect(messages[1].content).toContain('## Additional Context');
    expect(messages[1].content).toContain('Target audience is millennials in Jakarta');
  });

  it('does not include additional context section when not provided', () => {
    const messages = buildPromptGenerationMessages({
      originalInput: 'Launch a new coffee brand',
      sourceLanguage: 'en',
    });

    expect(messages[1].content).not.toContain('## Additional Context');
  });

  it('includes source language instruction', () => {
    const messages = buildPromptGenerationMessages({
      originalInput: 'Peluncuran brand kopi baru',
      sourceLanguage: 'id',
    });

    expect(messages[1].content).toContain('## Language');
    expect(messages[1].content).toContain('The input language is: id');
    expect(messages[1].content).toContain('Write the instruction in the same language as the input');
  });
});

describe('buildPromptRevisionMessages', () => {
  it('returns correct message structure with current prompt and instruction', () => {
    const currentPrompt = 'Write an engaging post about coffee culture';
    const instruction = 'Make it more casual and add humor';

    const messages = buildPromptRevisionMessages(currentPrompt, instruction);

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
    expect(messages[0].content).toContain('prompt engineer');
    expect(messages[0].content).toContain('revision');
    expect(messages[1].content).toContain('## Current Writing Instruction');
    expect(messages[1].content).toContain(currentPrompt);
    expect(messages[1].content).toContain('## Revision Instruction');
    expect(messages[1].content).toContain(instruction);
  });
});
