import { Request, Response } from 'express';
import { getAllIntegrations } from '../integrations/registry';

// ============================================================
// GET /api/integrations — List all integrations
// ============================================================

export function handleIntegrations(_req: Request, res: Response): void {
  const integrations = getAllIntegrations();

  res.json({
    total: integrations.length,
    implemented: integrations.filter((i) => i.status === 'implemented').length,
    stubbed: integrations.filter((i) => i.status === 'stubbed').length,
    integrations: integrations.map((i) => ({
      id: i.id,
      displayName: i.displayName,
      description: i.description,
      authType: i.authType,
      triggers: i.triggers,
      actions: i.actions,
      status: i.status,
    })),
  });
}
