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

    const choice = data.choices?.[0];
    if (!choice) {
      throw new Error('AI provider returned no choices');
    }

    return {
      content: choice.message?.content || '',
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
