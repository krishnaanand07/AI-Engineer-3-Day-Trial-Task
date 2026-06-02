// ============================================================
// API Client Helpers
// ============================================================

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function startGeneration(prompt: string): Promise<{ jobId: string }> {
  const response = await fetch(`${BACKEND_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start generation');
  }

  return response.json();
}

export async function getJobStatus(jobId: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${BACKEND_URL}/api/generate/${jobId}`);

  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch {
      // ignore
    }
    throw new Error(`Failed to fetch job status: ${response.status} ${response.statusText}. Body: ${errorBody}`);
  }

  return response.json();
}

export async function getIntegrations(): Promise<Record<string, unknown>> {
  const response = await fetch(`${BACKEND_URL}/api/integrations`);

  if (!response.ok) {
    throw new Error('Failed to fetch integrations');
  }

  return response.json();
}

export async function triggerRepair(
  jobId: string,
  stage: string
): Promise<Record<string, unknown>> {
  const response = await fetch(`${BACKEND_URL}/api/generate/${jobId}/repair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage }),
  });

  if (!response.ok) {
    throw new Error('Failed to trigger repair');
  }

  return response.json();
}

export { BACKEND_URL };
