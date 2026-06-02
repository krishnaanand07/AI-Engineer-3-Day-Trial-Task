import { StageName } from '../types/pipeline';

// ============================================================
// Model Routing Configuration
// ============================================================

export interface StageRouting {
  primary: string;
  fallback: string;
  tertiary?: string;
}

export interface ModelRoutingConfig {
  intentExtraction: StageRouting;
  schemaGeneration: StageRouting;
  appSpecGeneration: StageRouting;
  repair: StageRouting;
}

/**
 * Config-driven model routing.
 * Gemini handles all stages; OpenRouter is the universal fallback.
 */
export const modelRouting: ModelRoutingConfig = {
  intentExtraction: {
    primary: 'gemini',
    fallback: 'openrouter',
    tertiary: 'mistral',
  },
  schemaGeneration: {
    primary: 'gemini',
    fallback: 'openrouter',
    tertiary: 'mistral',
  },
  appSpecGeneration: {
    primary: 'gemini',
    fallback: 'openrouter',
    tertiary: 'mistral',
  },
  repair: {
    primary: 'gemini',
    fallback: 'openrouter',
    tertiary: 'mistral',
  },
};

/**
 * Get routing config for a given pipeline stage.
 */
export function getRoutingForStage(stage: StageName | 'repair'): StageRouting {
  return modelRouting[stage];
}
