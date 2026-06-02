import { StageResult, StageName, RepairAttempt } from '../types/pipeline';
import { jobStore } from '../store/jobStore';
import { repairStructural } from './structural';
import { repairFields } from './field';
import { repairConsistency } from './consistency';
import { AppIntentSchema } from '../types/appIntent';
import { DataSchemaSchema } from '../types/dataSchema';
import { AppSpecSchema } from '../types/appSpec';

// ============================================================
// Repair Engine Orchestrator
// ============================================================

/**
 * Map stage name to schema type for field repair.
 */
function stageToSchemaType(stage: StageName): 'intent' | 'schema' | 'appSpec' {
  switch (stage) {
    case 'intentExtraction': return 'intent';
    case 'schemaGeneration': return 'schema';
    case 'appSpecGeneration': return 'appSpec';
  }
}

/**
 * Try to re-validate output with the appropriate Zod schema.
 */
function zodParse(stage: StageName, obj: Record<string, unknown>): { success: boolean; data?: unknown } {
  switch (stage) {
    case 'intentExtraction': {
      const r = AppIntentSchema.safeParse(obj);
      return { success: r.success, data: r.success ? r.data : undefined };
    }
    case 'schemaGeneration': {
      const r = DataSchemaSchema.safeParse(obj);
      return { success: r.success, data: r.success ? r.data : undefined };
    }
    case 'appSpecGeneration': {
      const r = AppSpecSchema.safeParse(obj);
      return { success: r.success, data: r.success ? r.data : undefined };
    }
  }
}

/**
 * Attempt to repair a failed stage output.
 * Strategy order: structural → field → consistency (cheapest first).
 * Returns repaired StageResult or null if repair failed.
 */
export async function repairStageOutput(
  jobId: string,
  stage: StageName,
  failedResult: StageResult,
  validate: (result: StageResult) => string[],
): Promise<StageResult | null> {
  const job = jobStore.getJob(jobId);
  if (!job) return null;

  let currentOutput = failedResult.output as Record<string, unknown> | null;

  // ─── Strategy 1: Structural repair ───
  if (currentOutput || typeof failedResult.error === 'string') {
    const inputForRepair = currentOutput || failedResult.error || '';

    const { repaired, details } = repairStructural(inputForRepair);

    const attempt: RepairAttempt = {
      stage,
      strategy: 'structural',
      errorInput: typeof inputForRepair === 'string' ? inputForRepair.substring(0, 200) : JSON.stringify(inputForRepair).substring(0, 200),
      outcome: repaired ? 'repaired' : 'failed',
      repairDetails: details,
      timestamp: new Date().toISOString(),
    };
    job.repairLog.push(attempt);

    // Emit repair attempt SSE
    jobStore.emitEvent(jobId, {
      type: 'repair_attempt',
      stage,
      data: { strategy: 'structural', outcome: attempt.outcome, details },
      timestamp: new Date().toISOString(),
    });

    if (repaired) {
      currentOutput = repaired;
      // Check if it passes Zod now
      const zodResult = zodParse(stage, repaired);
      if (zodResult.success) {
        const repairedResult: StageResult = {
          ...failedResult,
          status: 'repaired',
          output: zodResult.data as StageResult['output'],
          error: undefined,
        };
        const validationErrors = validate(repairedResult);
        if (validationErrors.length === 0) {
          jobStore.updateJob(jobId, { repairLog: job.repairLog });
          return repairedResult;
        }
      }
    }
  }

  // ─── Strategy 2: Field repair ───
  if (currentOutput) {
    const schemaType = stageToSchemaType(stage);
    const { repaired, fieldsFixed } = repairFields(
      JSON.parse(JSON.stringify(currentOutput)), // deep clone
      schemaType
    );

    const attempt: RepairAttempt = {
      stage,
      strategy: 'field',
      errorInput: JSON.stringify(currentOutput).substring(0, 200),
      outcome: fieldsFixed.length > 0 ? 'repaired' : 'failed',
      repairDetails: fieldsFixed.length > 0
        ? `Fixed fields: ${fieldsFixed.join(', ')}`
        : 'No field repairs needed',
      timestamp: new Date().toISOString(),
    };
    job.repairLog.push(attempt);

    jobStore.emitEvent(jobId, {
      type: 'repair_attempt',
      stage,
      data: { strategy: 'field', outcome: attempt.outcome, details: attempt.repairDetails },
      timestamp: new Date().toISOString(),
    });

    if (fieldsFixed.length > 0) {
      currentOutput = repaired;
      const zodResult = zodParse(stage, repaired);
      if (zodResult.success) {
        const repairedResult: StageResult = {
          ...failedResult,
          status: 'repaired',
          output: zodResult.data as StageResult['output'],
          error: undefined,
        };
        const validationErrors = validate(repairedResult);
        if (validationErrors.length === 0) {
          jobStore.updateJob(jobId, { repairLog: job.repairLog });
          return repairedResult;
        }
      }
    }
  }

  // ─── Strategy 3: Consistency repair (only for appSpec) ───
  if (currentOutput && stage === 'appSpecGeneration') {
    // Get entity names from the dataSchema in the job result
    const dataSchema = job.result.dataSchema;
    const entityNames = dataSchema
      ? dataSchema.entities.map((e) => e.name)
      : [];

    const { repaired, fixesApplied } = repairConsistency(
      JSON.parse(JSON.stringify(currentOutput)),
      entityNames
    );

    const attempt: RepairAttempt = {
      stage,
      strategy: 'consistency',
      errorInput: JSON.stringify(currentOutput).substring(0, 200),
      outcome: fixesApplied.length > 0 ? 'repaired' : 'failed',
      repairDetails: fixesApplied.length > 0
        ? `Applied fixes: ${fixesApplied.join(', ')}`
        : 'No consistency fixes needed',
      timestamp: new Date().toISOString(),
    };
    job.repairLog.push(attempt);

    jobStore.emitEvent(jobId, {
      type: 'repair_attempt',
      stage,
      data: { strategy: 'consistency', outcome: attempt.outcome, details: attempt.repairDetails },
      timestamp: new Date().toISOString(),
    });

    if (fixesApplied.length > 0) {
      const zodResult = zodParse(stage, repaired);
      if (zodResult.success) {
        const repairedResult: StageResult = {
          ...failedResult,
          status: 'repaired',
          output: zodResult.data as StageResult['output'],
          error: undefined,
        };
        const validationErrors = validate(repairedResult);
        if (validationErrors.length === 0) {
          jobStore.updateJob(jobId, { repairLog: job.repairLog });
          return repairedResult;
        }
      }
    }
  }

  // All repair strategies exhausted
  jobStore.updateJob(jobId, { repairLog: job.repairLog });
  console.log(`[Repair] All strategies exhausted for ${stage} in job ${jobId}`);
  return null;
}
