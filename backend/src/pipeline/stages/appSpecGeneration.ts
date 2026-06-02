import { AIGateway } from '../../gateway';
import { AIGenerationError } from '../../gateway/baseProvider';
import { AppIntent } from '../../types/appIntent';
import { DataSchema } from '../../types/dataSchema';
import { AppSpec, AppSpecSchema } from '../../types/appSpec';
import { buildAppSpecPrompt } from '../prompts/appSpecPrompt';
import { StageResult } from '../../types/pipeline';

// ============================================================
// Stage 3: AppSpec Generation
// ============================================================

/**
 * Generate AppSpec from AppIntent and DataSchema.
 * Validates output with Zod.
 */
export async function generateAppSpec(
  appIntent: AppIntent,
  dataSchema: DataSchema,
  gateway: AIGateway
): Promise<StageResult> {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  try {
    const { systemPrompt, userPrompt } = buildAppSpecPrompt(appIntent, dataSchema);

    const response = await gateway.generate('appSpecGeneration', userPrompt, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 8192,
      validator: (result) => {
        const parsed = AppSpecSchema.safeParse(result);
        if (!parsed.success) {
          throw new Error(`Zod validation failed: ${parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`);
        }
      }
    });

    const parsed = AppSpecSchema.safeParse(response.result);
    if (!parsed.success) throw new Error('Unreachable');

    return {
      stage: 'appSpecGeneration',
      status: 'complete',
      output: parsed.data,
      latencyMs: Date.now() - startTime,
      provider: response.provider,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    let output: AppSpec | null = null;
    if (error instanceof AIGenerationError && error.lastOutput) {
      output = error.lastOutput as unknown as AppSpec;
    }

    return {
      stage: 'appSpecGeneration',
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
