import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIProviderResponse, AIProviderOptions } from './baseProvider';

// ============================================================
// Gemini Provider — Primary provider for all pipeline stages
// ============================================================

export class GeminiProvider extends AIProvider {
  readonly name = 'gemini';
  private client: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor() {
    super();
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    if (this.isConfigured()) {
      this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    }
  }

  isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  async generateJSON(
    prompt: string,
    options?: AIProviderOptions
  ): Promise<AIProviderResponse> {
    if (!this.client) {
      throw new Error('Gemini provider is not configured. Set GEMINI_API_KEY.');
    }

    const startTime = Date.now();

    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 8192,
        responseMimeType: 'application/json',
      },
    });

    const parts: string[] = [];

    if (options?.systemPrompt) {
      parts.push(options.systemPrompt);
    }

    parts.push(prompt);

    // Retry logic for rate limiting
    let lastError: Error | null = null;
    const maxRetries = 2;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await model.generateContent(parts.join('\n\n'));
        const response = result.response;
        const text = response.text();

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
            throw new Error(`Failed to parse Gemini response as JSON: ${text.substring(0, 200)}`);
          }
        }

        const latencyMs = Date.now() - startTime;

        return {
          result: parsed,
          provider: `gemini/${this.modelName}`,
          latencyMs,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMsg = lastError.message.toLowerCase();

        // Retry on rate limit (429) or server error (503)
        if ((errorMsg.includes('429') || errorMsg.includes('resource_exhausted') || errorMsg.includes('503')) && attempt < maxRetries - 1) {
          const delay = 40000; // 40s — free tier rate limits often require 30s+
          console.log(`[Gemini] Rate limited, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw lastError;
      }
    }

    throw lastError || new Error('Gemini generation failed after retries');
  }
}
