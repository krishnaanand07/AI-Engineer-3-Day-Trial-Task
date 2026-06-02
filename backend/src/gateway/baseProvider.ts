// ============================================================
// AI Gateway — Abstract Provider Interface
// ============================================================

export interface AIProviderResponse {
  result: Record<string, unknown>;
  provider: string;
  latencyMs: number;
}

export interface AIProviderOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  validator?: (parsed: Record<string, unknown>) => void;
}

export class AIGenerationError extends Error {
  constructor(message: string, public lastOutput?: Record<string, unknown>) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

export abstract class AIProvider {
  abstract readonly name: string;

  /**
   * Generate a JSON response from a prompt.
   * The provider should return parsed JSON, not raw text.
   */
  abstract generateJSON(
    prompt: string,
    options?: AIProviderOptions
  ): Promise<AIProviderResponse>;

  /**
   * Check if this provider is configured (has API key).
   */
  abstract isConfigured(): boolean;
}
