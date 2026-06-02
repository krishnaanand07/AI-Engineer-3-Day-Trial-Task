import { Request, Response } from 'express';
import { jobStore } from '../store/jobStore';

// ============================================================
// GET /api/generate/:jobId — Get job status and results
// ============================================================

export function handleStatus(req: Request, res: Response): void {
  const { jobId } = req.params;

  const job = jobStore.getJob(jobId);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json({
    jobId: job.jobId,
    status: job.status,
    prompt: job.prompt,
    stages: job.stages.map((s) => ({
      stage: s.stage,
      status: s.status,
      latencyMs: s.latencyMs,
      provider: s.provider,
      error: s.error,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
    })),
    repairLog: job.repairLog,
    result: job.result,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
  });
}
