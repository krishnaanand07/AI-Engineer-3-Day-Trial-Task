import { AIProvider, AIProviderResponse, AIProviderOptions } from './baseProvider';

// ============================================================
// OpenRouter Provider — Universal fallback
// ============================================================

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class OpenRouterProvider extends AIProvider {
  readonly name = 'openrouter';
  private modelName: string;

  constructor() {
    super();
    this.modelName = process.env.OPENROUTER_MODEL || 'openrouter/auto';
  }

  isConfigured(): boolean {
    return !!process.env.OPENROUTER_API_KEY;
  }

  async generateJSON(
    prompt: string,
    options?: AIProviderOptions
  ): Promise<AIProviderResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter provider is not configured. Set OPENROUTER_API_KEY.');
    }

    const startTime = Date.now();

    const messages: Array<{ role: string; content: string }> = [];

    if (options?.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://oneatlas-pipeline.local',
        'X-Title': 'OneAtlas AI Pipeline',
      },
      body: JSON.stringify({
        model: this.modelName,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 8192,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as Record<string, unknown>;
    const choices = data.choices as Array<Record<string, unknown>> | undefined;
    const text = (choices?.[0]?.message as Record<string, unknown>)?.content as string || '';

    // Parse the JSON response
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error(`Failed to parse OpenRouter response as JSON: ${text.substring(0, 200)}`);
      }
    }

    const latencyMs = Date.now() - startTime;

    return {
      result: parsed,
      provider: `openrouter/${this.modelName}`,
      latencyMs,
    };
  }
}
