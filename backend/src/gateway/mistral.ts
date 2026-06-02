import { AIProvider, AIProviderResponse, AIProviderOptions } from './baseProvider';

// ============================================================
// Mistral Provider
// ============================================================

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

export class MistralProvider extends AIProvider {
  readonly name = 'mistral';
  private modelName: string;

  constructor() {
    super();
    // Defaulting to mistral-small-latest, which is fast and cost-effective/free tier friendly
    this.modelName = process.env.MISTRAL_MODEL || 'mistral-small-latest';
  }

  isConfigured(): boolean {
    return !!process.env.MISTRAL_API_KEY;
  }

  async generateJSON(
    prompt: string,
    options?: AIProviderOptions
  ): Promise<AIProviderResponse> {
    if (!this.isConfigured()) {
      throw new Error('Mistral provider is not configured. Set MISTRAL_API_KEY.');
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

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelName,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API error (${response.status}): ${errorText}`);
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
        throw new Error(`Failed to parse Mistral response as JSON: ${text.substring(0, 200)}`);
      }
    }

    const latencyMs = Date.now() - startTime;

    return {
      result: parsed,
      provider: `mistral/${this.modelName}`,
      latencyMs,
    };
  }
}
