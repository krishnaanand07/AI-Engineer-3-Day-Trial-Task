import { AIGateway } from '../../gateway';
import { AIGenerationError } from '../../gateway/baseProvider';
import { AppIntent } from '../../types/appIntent';
import { DataSchema, DataSchemaSchema } from '../../types/dataSchema';
import { buildSchemaGenerationPrompt } from '../prompts/schemaPrompt';
import { StageResult } from '../../types/pipeline';

// ============================================================
// Stage 2: Schema Generation
// ============================================================

/**
 * Generate DataSchema from an AppIntent.
 * Ensures tenantId on every entity and validates with Zod.
 */
export async function generateSchema(
  appIntent: AppIntent,
  gateway: AIGateway
): Promise<StageResult> {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  try {
    const { systemPrompt, userPrompt } = buildSchemaGenerationPrompt(appIntent);

    const response = await gateway.generate('schemaGeneration', userPrompt, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 8192,
      validator: (result) => {
        const parsed = DataSchemaSchema.safeParse(result);
        if (!parsed.success) {
          throw new Error(`Zod validation failed: ${parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`);
        }
      }
    });

    const parsed = DataSchemaSchema.safeParse(response.result);
    if (!parsed.success) throw new Error('Unreachable');

    // Post-process: ensure tenantId exists on every entity
    const schema = parsed.data;
    for (const entity of schema.entities) {
      const hasTenantId = entity.fields.some((f) => f.name === 'tenantId');
      if (!hasTenantId) {
        entity.fields.push({
          name: 'tenantId',
          type: 'uuid',
          nullable: false,
          isPrimary: false,
          isUnique: false,
          isRelation: false,
        });
      }
    }

    return {
      stage: 'schemaGeneration',
      status: 'complete',
      output: schema,
      latencyMs: Date.now() - startTime,
      provider: response.provider,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    let output: DataSchema | null = null;
    if (error instanceof AIGenerationError && error.lastOutput) {
      output = error.lastOutput as unknown as DataSchema;
    }

    return {
      stage: 'schemaGeneration',
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
