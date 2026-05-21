import { describe, it, expect } from 'vitest';
import { buildGenerationPrompt } from '../prompt-builder.js';
import {
  buildPromptGenerationMessages,
  buildBrandVoiceSection,
} from '../prompt-generator.js';
import type { GenerationInput } from '../types.js';
import type { BrandVoiceInput } from '../prompt-generator.js';

const sampleBrandVoice: BrandVoiceInput = {
  name: 'Brand Formal',
  tone: 'profesional, hangat, informatif',
  styleRules: 'Gunakan kalimat pendek. Hindari jargon teknis.',
  audience: 'profesional muda usia 25-35',
  bannedWords: ['murah', 'gratis', 'diskon'],
  ctaPreferences: 'Selalu akhiri dengan pertanyaan untuk engagement',
  languageStyle: 'campuran Indonesia-Inggris',
  contentLengthGuidance: 'singkat dan padat, maks 3 paragraf',
};

describe('buildBrandVoiceSection', () => {
  it('includes all brand voice fields when provided', () => {
    const section = buildBrandVoiceSection(sampleBrandVoice);

    expect(section).toContain('## Brand Voice: Brand Formal');
    expect(section).toContain('Tone: profesional, hangat, informatif');
    expect(section).toContain('Target audience: profesional muda usia 25-35');
    expect(section).toContain('Style rules: Gunakan kalimat pendek. Hindari jargon teknis.');
    expect(section).toContain('Words to avoid: murah, gratis, diskon');
    expect(section).toContain('CTA preferences: Selalu akhiri dengan pertanyaan untuk engagement');
    expect(section).toContain('Language style: campuran Indonesia-Inggris');
    expect(section).toContain('Content length guidance: singkat dan padat, maks 3 paragraf');
  });

  it('omits optional fields when null or empty', () => {
    const minimalVoice: BrandVoiceInput = {
      name: 'Minimal',
      tone: 'casual',
    };

    const section = buildBrandVoiceSection(minimalVoice);

    expect(section).toContain('## Brand Voice: Minimal');
    expect(section).toContain('Tone: casual');
    expect(section).not.toContain('Target audience');
    expect(section).not.toContain('Style rules');
    expect(section).not.toContain('Words to avoid');
    expect(section).not.toContain('CTA preferences');
    expect(section).not.toContain('Language style');
    expect(section).not.toContain('Content length guidance');
  });

  it('omits banned words when array is empty', () => {
    const voice: BrandVoiceInput = {
      name: 'NoBanned',
      tone: 'friendly',
      bannedWords: [],
    };

    const section = buildBrandVoiceSection(voice);
    expect(section).not.toContain('Words to avoid');
  });
});

describe('Prompt Integration — buildPromptGenerationMessages with brand voice', () => {
  it('includes brand voice section when provided', () => {
    const messages = buildPromptGenerationMessages({
      originalInput: 'Peluncuran brand kopi baru',
      sourceLanguage: 'id',
      brandVoice: sampleBrandVoice,
    });

    const userContent = messages[1].content;
    expect(userContent).toContain('## Brand Voice: Brand Formal');
    expect(userContent).toContain('Tone: profesional, hangat, informatif');
    expect(userContent).toContain('Words to avoid: murah, gratis, diskon');
  });

  it('does not include brand voice section when not provided', () => {
    const messages = buildPromptGenerationMessages({
      originalInput: 'Peluncuran brand kopi baru',
      sourceLanguage: 'id',
    });

    const userContent = messages[1].content;
    expect(userContent).not.toContain('## Brand Voice');
  });

  it('preserves prompt-first flow — still includes user input and language', () => {
    const messages = buildPromptGenerationMessages({
      originalInput: 'Peluncuran brand kopi baru',
      additionalContext: 'Target Jakarta',
      sourceLanguage: 'id',
      brandVoice: sampleBrandVoice,
    });

    const userContent = messages[1].content;
    expect(userContent).toContain("## User's Input");
    expect(userContent).toContain('Peluncuran brand kopi baru');
    expect(userContent).toContain('## Additional Context');
    expect(userContent).toContain('Target Jakarta');
    expect(userContent).toContain('## Language');
    expect(userContent).toContain('The input language is: id');
  });

  it('system prompt mentions brand voice incorporation', () => {
    const messages = buildPromptGenerationMessages({
      originalInput: 'Test',
      sourceLanguage: 'en',
      brandVoice: sampleBrandVoice,
    });

    expect(messages[0].content).toContain('brand voice');
  });
});

describe('Content Integration — buildGenerationPrompt with brand voice', () => {
  const baseInput: GenerationInput = {
    originalInput: 'Launch a new artisan coffee brand in Jakarta',
    sourceType: 'idea',
    platforms: ['instagram_feed', 'linkedin'],
  };

  it('includes brand voice in content generation prompt', () => {
    const messages = buildGenerationPrompt(
      { ...baseInput, brandVoice: sampleBrandVoice },
      'instagram_feed'
    );

    const userContent = messages[1].content;
    expect(userContent).toContain('## Brand Voice: Brand Formal');
    expect(userContent).toContain('Tone: profesional, hangat, informatif');
    expect(userContent).toContain('Words to avoid: murah, gratis, diskon');
    expect(userContent).toContain('Follow the brand voice guidelines above while respecting');
  });

  it('does not include brand voice when not provided (backward compat)', () => {
    const messages = buildGenerationPrompt(baseInput, 'instagram_feed');

    const userContent = messages[1].content;
    expect(userContent).not.toContain('## Brand Voice');
    expect(userContent).not.toContain('Follow the brand voice guidelines');
  });

  it('still includes platform requirements alongside brand voice', () => {
    const messages = buildGenerationPrompt(
      { ...baseInput, brandVoice: sampleBrandVoice },
      'instagram_feed'
    );

    const userContent = messages[1].content;
    expect(userContent).toContain('## Platform Requirements');
    expect(userContent).toContain('Instagram Feed');
    expect(userContent).toContain('2200');
  });

  it('still uses approvedPrompt when brand voice is present', () => {
    const messages = buildGenerationPrompt(
      {
        ...baseInput,
        approvedPrompt: 'Write about artisan coffee for young professionals',
        brandVoice: sampleBrandVoice,
      },
      'linkedin'
    );

    const userContent = messages[1].content;
    expect(userContent).toContain('## Writing Instruction (Approved Prompt)');
    expect(userContent).toContain('Write about artisan coffee for young professionals');
    expect(userContent).toContain('## Brand Voice: Brand Formal');
    expect(userContent).not.toContain('## Source');
  });

  it('system prompt mentions brand voice rules', () => {
    const messages = buildGenerationPrompt(
      { ...baseInput, brandVoice: sampleBrandVoice },
      'instagram_feed'
    );

    expect(messages[0].content).toContain('brand voice');
  });
});

describe('Backward Compatibility — old flows without brand voice', () => {
  it('prompt generation works without brand voice (no regression)', () => {
    const messages = buildPromptGenerationMessages({
      originalInput: 'Ide konten baru',
      sourceLanguage: 'id',
    });

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toContain('Ide konten baru');
    expect(messages[1].content).not.toContain('Brand Voice');
  });

  it('content generation works without brand voice (no regression)', () => {
    const input: GenerationInput = {
      originalInput: 'Test content',
      sourceType: 'draft',
      platforms: ['threads'],
    };

    const messages = buildGenerationPrompt(input, 'threads');

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toContain('CaptionSan');
    expect(messages[1].content).toContain('Threads');
    expect(messages[1].content).toContain('Test content');
    expect(messages[1].content).not.toContain('Brand Voice');
  });

  it('content generation with approvedPrompt and no brand voice still works', () => {
    const input: GenerationInput = {
      originalInput: 'Original idea',
      sourceType: 'idea',
      platforms: ['whatsapp_status'],
      approvedPrompt: 'Write a casual WhatsApp status about coffee',
    };

    const messages = buildGenerationPrompt(input, 'whatsapp_status');
    const userContent = messages[1].content;

    expect(userContent).toContain('## Writing Instruction (Approved Prompt)');
    expect(userContent).toContain('Write a casual WhatsApp status about coffee');
    expect(userContent).not.toContain('Brand Voice');
  });
});
