import { Request, Response } from 'express';
import { jobStore } from '../store/jobStore';
import { runPipeline } from '../pipeline/orchestrator';

// ============================================================
// POST /api/generate — Start a new generation job
// ============================================================

export async function handleGenerate(req: Request, res: Response): Promise<void> {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    res.status(400).json({ error: 'Missing or empty "prompt" field' });
    return;
  }

  // Create job
  const jobId = jobStore.createJob(prompt.trim());

  // Start pipeline in background (don't await)
  runPipeline(jobId).catch((err) => {
    console.error(`[Generate] Pipeline error for job ${jobId}:`, err);
  });

  res.status(201).json({ jobId });
}
