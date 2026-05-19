import type { ChatMessage, Platform, GenerationInput } from './types.js';
import { PLATFORM_CONFIGS } from './platforms.js';

const SYSTEM_PROMPT = `You are CaptionSan, an expert content writer who creates platform-specific content from a single idea or draft. You write in the same language as the user's input. You adapt tone, length, and format to each platform's requirements.

Rules:
- Preserve the core message from the original input.
- Adapt tone and format to the target platform.
- Keep the output natural and ready to copy-paste.
- For Threads: split into numbered parts (1/, 2/, etc.).
- Do not add explanations or meta-commentary. Output only the content.
- Write in the same language as the input unless instructed otherwise.`;

export function buildGenerationPrompt(
  input: GenerationInput,
  platform: Platform
): ChatMessage[] {
  const config = PLATFORM_CONFIGS[platform];

  const userPrompt = buildUserPrompt(input, config);

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];
}

function buildUserPrompt(
  input: GenerationInput,
  config: typeof PLATFORM_CONFIGS[Platform]
): string {
  const parts: string[] = [];

  parts.push(`## Task`);
  parts.push(
    `Generate content for **${config.label}** based on the ${input.sourceType} below.`
  );

  parts.push(`\n## Platform Requirements`);
  parts.push(`- Platform: ${config.label}`);
  parts.push(`- Tone: ${config.tone}`);
  parts.push(`- Format: ${config.description}`);
  if (config.maxLength) {
    parts.push(`- Maximum length: ~${config.maxLength} characters`);
  }

  parts.push(`\n## Source (${input.sourceType === 'idea' ? 'Main Idea' : 'Rough Draft'})`);
  parts.push(input.originalInput);

  if (input.additionalContext) {
    parts.push(`\n## Additional Context`);
    parts.push(input.additionalContext);
  }

  parts.push(`\n## Output`);
  parts.push(`Write the ${config.label} content now. Output only the final content, nothing else.`);

  return parts.join('\n');
}

export function buildRevisionPrompt(
  currentContent: string,
  instruction: string,
  platform: Platform
): ChatMessage[] {
  const config = PLATFORM_CONFIGS[platform];

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `## Current Content (${config.label})\n${currentContent}\n\n## Revision Instruction\n${instruction}\n\n## Output\nRewrite the content following the instruction above. Output only the revised content, nothing else.`,
    },
  ];
}
