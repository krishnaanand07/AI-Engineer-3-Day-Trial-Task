import { AIGateway } from '../../gateway';
import { AIGenerationError } from '../../gateway/baseProvider';
import { AppIntent, AppIntentSchema } from '../../types/appIntent';
import { buildIntentExtractionPrompt } from '../prompts/intentPrompt';
import { StageResult } from '../../types/pipeline';

// ============================================================
// Stage 1: Intent Extraction
// ============================================================

/**
 * Extract AppIntent from a raw user prompt.
 * Returns a StageResult with the parsed AppIntent.
 */
export async function extractIntent(
  prompt: string,
  gateway: AIGateway
): Promise<StageResult> {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  try {
    const { systemPrompt, userPrompt } = buildIntentExtractionPrompt(prompt);

    const response = await gateway.generate('intentExtraction', userPrompt, {
      systemPrompt,
      temperature: 0.7,
      validator: (result) => {
        const parsed = AppIntentSchema.safeParse(result);
        if (!parsed.success) {
          throw new Error(`Zod validation failed: ${parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`);
        }
      }
    });

    const parsed = AppIntentSchema.safeParse(response.result);
    // We know parsed.success is true if we reach here because the validator would have thrown otherwise.
    if (!parsed.success) throw new Error('Unreachable');

    return {
      stage: 'intentExtraction',
      status: 'complete',
      output: parsed.data,
      latencyMs: Date.now() - startTime,
      provider: response.provider,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    let output: AppIntent | null = null;
    if (error instanceof AIGenerationError && error.lastOutput) {
      output = error.lastOutput as unknown as AppIntent;
    }

    return {
      stage: 'intentExtraction',
      status: 'failed',
      output,
      latencyMs: Date.now() - startTime,
      provider: 'unknown',
      error: error instanceof Error ? error.message : String(error),
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }
}
