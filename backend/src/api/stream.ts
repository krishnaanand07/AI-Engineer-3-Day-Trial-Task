import { Request, Response } from 'express';
import { jobStore } from '../store/jobStore';
import { SSEEvent } from '../types/pipeline';

// ============================================================
// GET /api/generate/:jobId/stream — SSE streaming endpoint
// ============================================================

export function handleStream(req: Request, res: Response): void {
  const { jobId } = req.params;

  const job = jobStore.getJob(jobId);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial connection event
  sendSSE(res, {
    type: 'stage_start',
    data: { message: 'Connected to SSE stream', jobId, status: job.status },
    timestamp: new Date().toISOString(),
  });

  // If job is already completed/failed, send the final state immediately
  if (job.status === 'completed' || job.status === 'failed') {
    // Send all existing stage results
    for (const stage of job.stages) {
      sendSSE(res, {
        type: stage.status === 'complete' || stage.status === 'repaired' ? 'stage_complete' : 'stage_failed',
        stage: stage.stage,
        data: {
          latencyMs: stage.latencyMs,
          provider: stage.provider,
          error: stage.error,
        },
        timestamp: stage.completedAt || new Date().toISOString(),
      });
    }

    // Send final event
    sendSSE(res, {
      type: job.status === 'completed' ? 'generation_complete' : 'generation_failed',
      data: { message: `Job already ${job.status}` },
      timestamp: new Date().toISOString(),
    });

    res.end();
    return;
  }

  // Subscribe to live events
  const unsubscribe = jobStore.subscribe(jobId, (event: SSEEvent) => {
    sendSSE(res, event);

    // Close stream on terminal events
    if (event.type === 'generation_complete' || event.type === 'generation_failed') {
      setTimeout(() => {
        unsubscribe();
        res.end();
      }, 100);
    }
  });

  // Handle client disconnect
  req.on('close', () => {
    unsubscribe();
  });
}

function sendSSE(res: Response, event: SSEEvent): void {
  res.write(`event: ${event.type}\n`);
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}
