import type { AIProviderConfig, ChatCompletionRequest, ChatCompletionResponse } from './types.js';

/**
 * Provider-agnostic AI client that works with any OpenAI-compatible API.
 */
export class AIClient {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2048,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `AI provider returned ${response.status}: ${errorBody.slice(0, 300)}`
      );
    }

    const data = await response.json();

    console.log('[AIClient] Raw response:', JSON.stringify(data).slice(0, 1000));

    const choice = data.choices?.[0];
    if (!choice) {
      console.error('[AIClient] No choices in response:', JSON.stringify(data).slice(0, 500));
      throw new Error('AI provider returned no choices');
    }

    // Support multiple response formats:
    // OpenAI standard: choice.message.content
    // Some providers: choice.text
    // Some providers: choice.delta.content (streaming leftover)
    const content = choice.message?.content || choice.text || choice.delta?.content || '';
    console.log('[AIClient] Extracted content length:', content.length, 'preview:', content.slice(0, 200));

    if (!content) {
      console.warn('[AIClient] Empty content from provider. Full choice:', JSON.stringify(choice).slice(0, 500));
    }

    return {
      content,
      finishReason: choice.finish_reason || 'unknown',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
