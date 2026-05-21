import type { ChatMessage, AIProviderConfig } from './types.js';
import { AIClient } from './client.js';

const PROMPT_ENGINEER_SYSTEM = `You are a prompt engineer. Given the user's rough idea or draft, create a detailed writing instruction that a content writer AI can use to generate platform-specific content. The instruction should capture the core message, tone intent, target audience, and key points. Output only the writing instruction, nothing else.

Guidelines:
- Analyze the user's input to identify the core message, intended audience, and emotional tone.
- Structure the writing instruction clearly so a content writer AI can produce high-quality outputs for multiple platforms (Instagram, Threads, LinkedIn, WhatsApp, Website).
- Include guidance on tone, key points to emphasize, and any constraints implied by the input.
- If the input is in a specific language, write the instruction in that same language.
- If a brand voice profile is provided, incorporate its tone, style rules, audience, and constraints into the writing instruction.
- Do not add meta-commentary or explanations. Output only the writing instruction.`;

export interface PromptGeneratorInput {
  originalInput: string;
  additionalContext?: string;
  sourceLanguage: string;
  brandVoice?: BrandVoiceInput;
}

export interface BrandVoiceInput {
  name: string;
  tone: string;
  styleRules?: string | null;
  audience?: string | null;
  bannedWords?: string[];
  ctaPreferences?: string | null;
  languageStyle?: string | null;
  contentLengthGuidance?: string | null;
}

export function buildBrandVoiceSection(brandVoice: BrandVoiceInput): string {
  const parts: string[] = [];
  parts.push(`## Brand Voice: ${brandVoice.name}`);
  parts.push(`- Tone: ${brandVoice.tone}`);

  if (brandVoice.audience) {
    parts.push(`- Target audience: ${brandVoice.audience}`);
  }
  if (brandVoice.styleRules) {
    parts.push(`- Style rules: ${brandVoice.styleRules}`);
  }
  if (brandVoice.bannedWords && brandVoice.bannedWords.length > 0) {
    parts.push(`- Words to avoid: ${brandVoice.bannedWords.join(', ')}`);
  }
  if (brandVoice.ctaPreferences) {
    parts.push(`- CTA preferences: ${brandVoice.ctaPreferences}`);
  }
  if (brandVoice.languageStyle) {
    parts.push(`- Language style: ${brandVoice.languageStyle}`);
  }
  if (brandVoice.contentLengthGuidance) {
    parts.push(`- Content length guidance: ${brandVoice.contentLengthGuidance}`);
  }

  return parts.join('\n');
}

export function buildPromptGenerationMessages(input: PromptGeneratorInput): ChatMessage[] {
  const parts: string[] = [];

  parts.push(`## User's Input`);
  parts.push(input.originalInput);

  if (input.additionalContext) {
    parts.push(`\n## Additional Context`);
    parts.push(input.additionalContext);
  }

  if (input.brandVoice) {
    parts.push(`\n${buildBrandVoiceSection(input.brandVoice)}`);
  }

  parts.push(`\n## Language`);
  parts.push(`The input language is: ${input.sourceLanguage}. Write the instruction in the same language as the input.`);

  return [
    { role: 'system', content: PROMPT_ENGINEER_SYSTEM },
    { role: 'user', content: parts.join('\n') },
  ];
}

export async function generatePromptDraft(
  input: PromptGeneratorInput,
  providerConfig: AIProviderConfig
): Promise<string> {
  const aiClient = new AIClient(providerConfig);
  const messages = buildPromptGenerationMessages(input);

  const response = await aiClient.chatCompletion({
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  const result = response.content.trim();
  if (!result) {
    throw new Error('AI provider returned empty prompt. Please check your provider configuration.');
  }

  return result;
}

const PROMPT_REVISION_SYSTEM = `You are a prompt engineer. The user has a writing instruction that needs revision. Apply the user's revision instruction to improve the prompt. Output only the revised writing instruction, nothing else.`;

export function buildPromptRevisionMessages(
  currentPrompt: string,
  instruction: string
): ChatMessage[] {
  return [
    { role: 'system', content: PROMPT_REVISION_SYSTEM },
    {
      role: 'user',
      content: `## Current Writing Instruction\n${currentPrompt}\n\n## Revision Instruction\n${instruction}`,
    },
  ];
}

export async function revisePromptDraft(
  currentPrompt: string,
  instruction: string,
  providerConfig: AIProviderConfig
): Promise<string> {
  const aiClient = new AIClient(providerConfig);
  const messages = buildPromptRevisionMessages(currentPrompt, instruction);

  const response = await aiClient.chatCompletion({
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return response.content.trim();
}
