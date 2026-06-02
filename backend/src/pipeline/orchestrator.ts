import { getGateway } from '../gateway';
import { jobStore } from '../store/jobStore';
import { extractIntent } from './stages/intentExtraction';
import { generateSchema } from './stages/schemaGeneration';
import { generateAppSpec } from './stages/appSpecGeneration';
import { Job, StageResult, StageName, SSEEvent } from '../types/pipeline';
import { AppIntent } from '../types/appIntent';
import { DataSchema } from '../types/dataSchema';
import { AppSpec } from '../types/appSpec';
import { validateIntent } from '../validation/intentValidator';
import { validateSchema } from '../validation/schemaValidator';
import { validateAppSpec } from '../validation/appSpecValidator';
import { repairStageOutput } from '../repair';

// ============================================================
// Pipeline Orchestrator
// ============================================================

/**
 * Run the full generation pipeline for a job.
 * Stages: Intent Extraction → Schema Generation → AppSpec Generation
 * Each stage is validated, and repair is attempted on failure.
 */
export async function runPipeline(jobId: string): Promise<void> {
  const gateway = getGateway();
  const job = jobStore.getJob(jobId);

  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  jobStore.updateJob(jobId, { status: 'running' });

  try {
    // ─── Stage 1: Intent Extraction ───
    const intentResult = await runStage(
      jobId,
      'intentExtraction',
      async () => extractIntent(job.prompt, gateway),
      (result) => validateIntent(result.output as AppIntent),
    );

    if (intentResult.status === 'failed') {
      failJob(jobId, 'intentExtraction', intentResult.error || 'Intent extraction failed');
      return;
    }

    const appIntent = intentResult.output as AppIntent;
    jobStore.updateJob(jobId, {
      result: { ...jobStore.getJob(jobId)!.result, appIntent },
    });

    // ─── Stage 2: Schema Generation ───
    const schemaResult = await runStage(
      jobId,
      'schemaGeneration',
      async () => generateSchema(appIntent, gateway),
      (result) => validateSchema(result.output as DataSchema),
    );

    if (schemaResult.status === 'failed') {
      failJob(jobId, 'schemaGeneration', schemaResult.error || 'Schema generation failed');
      return;
    }

    const dataSchema = schemaResult.output as DataSchema;
    jobStore.updateJob(jobId, {
      result: { ...jobStore.getJob(jobId)!.result, dataSchema },
    });

    // ─── Stage 3: AppSpec Generation ───
    const appSpecResult = await runStage(
      jobId,
      'appSpecGeneration',
      async () => generateAppSpec(appIntent, dataSchema, gateway),
      (result) => validateAppSpec(result.output as AppSpec, dataSchema),
    );

    if (appSpecResult.status === 'failed') {
      failJob(jobId, 'appSpecGeneration', appSpecResult.error || 'AppSpec generation failed');
      return;
    }

    const appSpec = appSpecResult.output as AppSpec;
    jobStore.updateJob(jobId, {
      status: 'completed',
      result: { ...jobStore.getJob(jobId)!.result, appSpec },
      completedAt: new Date().toISOString(),
    });

    emitSSE(jobId, {
      type: 'generation_complete',
      data: { message: 'Pipeline completed successfully' },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    jobStore.updateJob(jobId, {
      status: 'failed',
      completedAt: new Date().toISOString(),
    });
    emitSSE(jobId, {
      type: 'generation_failed',
      data: { error: errorMsg },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Run a single pipeline stage with validation and repair.
 */
async function runStage(
  jobId: string,
  stageName: StageName,
  execute: () => Promise<StageResult>,
  validate: (result: StageResult) => string[],
): Promise<StageResult> {
  // Emit stage_start
  emitSSE(jobId, {
    type: 'stage_start',
    stage: stageName,
    data: { message: `Starting ${stageName}` },
    timestamp: new Date().toISOString(),
  });

  // Execute the stage
  let result = await execute();

  // Add result to job stages
  const job = jobStore.getJob(jobId)!;
  job.stages.push(result);
  jobStore.updateJob(jobId, { stages: job.stages });

  // If stage itself failed (e.g., API error), try repair
  if (result.status === 'failed' && result.output) {
    console.log(`[Pipeline] ${stageName} failed, attempting repair...`);
    const repaired = await repairStageOutput(jobId, stageName, result, validate);
    if (repaired) {
      result = repaired;
      // Update the stage result in job
      job.stages[job.stages.length - 1] = result;
      jobStore.updateJob(jobId, { stages: job.stages });
    }
  }

  // If stage passed but has validation errors, try repair
  if (result.status === 'complete' && result.output) {
    const validationErrors = validate(result);
    if (validationErrors.length > 0) {
      console.log(`[Pipeline] ${stageName} has validation errors:`, validationErrors);
      result.status = 'failed';
      result.error = `Validation errors: ${validationErrors.join('; ')}`;

      const repaired = await repairStageOutput(jobId, stageName, result, validate);
      if (repaired) {
        result = repaired;
        job.stages[job.stages.length - 1] = result;
        jobStore.updateJob(jobId, { stages: job.stages });
      }
    }
  }

  // Emit stage result
  if (result.status === 'complete' || result.status === 'repaired') {
    emitSSE(jobId, {
      type: 'stage_complete',
      stage: stageName,
      data: {
        latencyMs: result.latencyMs,
        provider: result.provider,
      },
      timestamp: new Date().toISOString(),
    });
  } else {
    emitSSE(jobId, {
      type: 'stage_failed',
      stage: stageName,
      data: {
        error: result.error,
        latencyMs: result.latencyMs,
      },
      timestamp: new Date().toISOString(),
    });
  }

  return result;
}

function failJob(jobId: string, stage: StageName, error: string): void {
  jobStore.updateJob(jobId, {
    status: 'failed',
    completedAt: new Date().toISOString(),
  });
  emitSSE(jobId, {
    type: 'generation_failed',
    stage,
    data: { error },
    timestamp: new Date().toISOString(),
  });
}

function emitSSE(jobId: string, event: SSEEvent): void {
  jobStore.emitEvent(jobId, event);
}
