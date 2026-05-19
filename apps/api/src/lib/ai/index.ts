export { AIClient } from './client.js';
export { buildGenerationPrompt, buildRevisionPrompt } from './prompt-builder.js';
export { PLATFORM_CONFIGS, ALL_PLATFORMS } from './platforms.js';
export type {
  AIProviderConfig,
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  Platform,
  PlatformConfig,
  GenerationInput,
} from './types.js';
