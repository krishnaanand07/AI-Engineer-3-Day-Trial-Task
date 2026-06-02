import { Router } from 'express';
import { handleGenerate } from './generate';
import { handleStream } from './stream';
import { handleStatus } from './status';
import { handleIntegrations } from './integrations';
import { handleRepair } from './repair';

// ============================================================
// Express Route Definitions
// ============================================================

const router = Router();

// POST /api/generate — Start a new generation job
router.post('/generate', handleGenerate);

// GET /api/generate/:jobId/stream — SSE event stream
router.get('/generate/:jobId/stream', handleStream);

// GET /api/generate/:jobId — Get job status
router.get('/generate/:jobId', handleStatus);

// GET /api/integrations — List all integrations
router.get('/integrations', handleIntegrations);

// POST /api/generate/:jobId/repair — Manual repair trigger
router.post('/generate/:jobId/repair', handleRepair);

export default router;
