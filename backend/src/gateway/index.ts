import { AIProvider, AIProviderResponse, AIProviderOptions, AIGenerationError } from './baseProvider';
import { GeminiProvider } from './gemini';
import { OpenRouterProvider } from './openrouter';
import { MistralProvider } from './mistral';
import { getRoutingForStage } from '../config/modelRouting';
import { StageName } from '../types/pipeline';

// ============================================================
// AI Gateway Orchestrator
// ============================================================

/**
 * AI Gateway — routes requests to providers based on config.
 * Simple fallback: try primary → on error → try fallback.
 */
export class AIGateway {
  private providers: Map<string, AIProvider>;

  constructor() {
    this.providers = new Map();

    const gemini = new GeminiProvider();
    const openrouter = new OpenRouterProvider();
    const mistral = new MistralProvider();

    if (gemini.isConfigured()) {
      this.providers.set('gemini', gemini);
    }
    if (openrouter.isConfigured()) {
      this.providers.set('openrouter', openrouter);
    }
    if (mistral.isConfigured()) {
      this.providers.set('mistral', mistral);
    }

    if (this.providers.size === 0) {
      console.warn('[AIGateway] No providers configured! Pipeline will fail.');
    } else {
      console.log(
        `[AIGateway] Initialized with providers: ${Array.from(this.providers.keys()).join(', ')}`
      );
    }
  }

  /**
   * Generate JSON for a pipeline stage.
   * Uses routing config to determine primary/fallback providers.
   */
  async generate(
    stage: StageName | 'repair',
    prompt: string,
    options?: AIProviderOptions
  ): Promise<AIProviderResponse> {
    const routing = getRoutingForStage(stage);

    let lastOutput: Record<string, unknown> | undefined;

    // Try primary provider
    const primary = this.providers.get(routing.primary);
    if (primary) {
      try {
        console.log(`[AIGateway] ${stage}: trying primary provider '${routing.primary}'`);
        const response = await primary.generateJSON(prompt, options);
        lastOutput = response.result;
        if (options?.validator) options.validator(response.result);
        console.log(
          `[AIGateway] ${stage}: success via '${response.provider}' (${response.latencyMs}ms)`
        );
        return response;
      } catch (error) {
        console.error(
          `[AIGateway] ${stage}: primary provider '${routing.primary}' failed:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    // Try fallback provider
    const fallback = this.providers.get(routing.fallback);
    if (fallback && fallback !== primary) {
      try {
        console.log(`[AIGateway] ${stage}: trying fallback provider '${routing.fallback}'`);
        const response = await fallback.generateJSON(prompt, options);
        lastOutput = response.result;
        if (options?.validator) options.validator(response.result);
        console.log(
          `[AIGateway] ${stage}: success via fallback '${response.provider}' (${response.latencyMs}ms)`
        );
        return response;
      } catch (error) {
        console.error(
          `[AIGateway] ${stage}: fallback provider '${routing.fallback}' failed:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    // Try tertiary provider
    if (routing.tertiary) {
      const tertiary = this.providers.get(routing.tertiary);
      if (tertiary && tertiary !== primary && tertiary !== fallback) {
        try {
          console.log(`[AIGateway] ${stage}: trying tertiary provider '${routing.tertiary}'`);
          const response = await tertiary.generateJSON(prompt, options);
          lastOutput = response.result;
          if (options?.validator) options.validator(response.result);
          console.log(
            `[AIGateway] ${stage}: success via tertiary '${response.provider}' (${response.latencyMs}ms)`
          );
          return response;
        } catch (error) {
          console.error(
            `[AIGateway] ${stage}: tertiary provider '${routing.tertiary}' failed:`,
            error instanceof Error ? error.message : error
          );
        }
      }
    }

    throw new AIGenerationError(
      `[AIGateway] ${stage}: all providers failed. Primary='${routing.primary}', Fallback='${routing.fallback}', Tertiary='${routing.tertiary || 'none'}'`,
      lastOutput
    );
  }

  /**
   * Get list of configured provider names.
   */
  getConfiguredProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Singleton instance
let gatewayInstance: AIGateway | null = null;

export function getGateway(): AIGateway {
  if (!gatewayInstance) {
    gatewayInstance = new AIGateway();
  }
  return gatewayInstance;
}
