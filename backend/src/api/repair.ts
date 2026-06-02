import { Request, Response } from 'express';
import { jobStore } from '../store/jobStore';
import { repairStageOutput } from '../repair';
import { validateIntent } from '../validation/intentValidator';
import { validateSchema } from '../validation/schemaValidator';
import { validateAppSpec } from '../validation/appSpecValidator';
import { StageName, StageResult } from '../types/pipeline';
import { AppIntent } from '../types/appIntent';
import { DataSchema } from '../types/dataSchema';
import { AppSpec } from '../types/appSpec';

// ============================================================
// POST /api/generate/:jobId/repair — Manual repair trigger
// ============================================================

export async function handleRepair(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  const { stage } = req.body;

  const job = jobStore.getJob(jobId);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  if (!stage || !['intentExtraction', 'schemaGeneration', 'appSpecGeneration'].includes(stage)) {
    res.status(400).json({ error: 'Invalid stage. Must be one of: intentExtraction, schemaGeneration, appSpecGeneration' });
    return;
  }

  const stageName = stage as StageName;

  // Find the failed stage result
  const failedStage = job.stages.find((s) => s.stage === stageName && s.status === 'failed');
  if (!failedStage) {
    res.status(400).json({ error: `No failed stage '${stage}' found for this job` });
    return;
  }

  // Get the appropriate validator
  const validate = (result: StageResult): string[] => {
    switch (stageName) {
      case 'intentExtraction':
        return validateIntent(result.output as AppIntent);
      case 'schemaGeneration':
        return validateSchema(result.output as DataSchema);
      case 'appSpecGeneration':
        return validateAppSpec(result.output as AppSpec, job.result.dataSchema);
    }
  };

  const repaired = await repairStageOutput(jobId, stageName, failedStage, validate);

  if (repaired) {
    res.json({
      success: true,
      message: `Stage '${stage}' repaired successfully`,
      repairLog: job.repairLog.filter((r) => r.stage === stageName),
    });
  } else {
    res.json({
      success: false,
      message: `Repair failed for stage '${stage}'`,
      repairLog: job.repairLog.filter((r) => r.stage === stageName),
    });
  }
}
