export interface AIProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  content: string;
  finishReason: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type Platform =
  | 'instagram_feed'
  | 'instagram_story'
  | 'threads'
  | 'whatsapp_status'
  | 'linkedin'
  | 'website';

export interface PlatformConfig {
  platform: Platform;
  label: string;
  tone: string;
  maxLength: number | null;
  description: string;
}

export interface GenerationInput {
  originalInput: string;
  sourceType: 'idea' | 'draft';
  additionalContext?: string;
  platforms: Platform[];
}
