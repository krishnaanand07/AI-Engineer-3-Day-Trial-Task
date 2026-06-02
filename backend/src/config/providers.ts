// ============================================================
// Provider Connection Configuration
// ============================================================

export interface ProviderConfig {
  name: string;
  apiKeyEnvVar: string;
  isConfigured: boolean;
}

/**
 * Returns the list of all provider configs and their status.
 */
export function getProviderConfigs(): ProviderConfig[] {
  return [
    {
      name: 'gemini',
      apiKeyEnvVar: 'GEMINI_API_KEY',
      isConfigured: !!process.env.GEMINI_API_KEY,
    },
    {
      name: 'openrouter',
      apiKeyEnvVar: 'OPENROUTER_API_KEY',
      isConfigured: !!process.env.OPENROUTER_API_KEY,
    },
    {
      name: 'mistral',
      apiKeyEnvVar: 'MISTRAL_API_KEY',
      isConfigured: !!process.env.MISTRAL_API_KEY,
    },
  ];
}

/**
 * Validate that at least one provider is configured.
 */
export function validateProviders(): void {
  const configs = getProviderConfigs();
  const configured = configs.filter((c) => c.isConfigured);

  if (configured.length === 0) {
    throw new Error(
      'No AI providers configured. Set at least one of: GEMINI_API_KEY, OPENROUTER_API_KEY, MISTRAL_API_KEY'
    );
  }

  console.log(
    `[Providers] Configured: ${configured.map((c) => c.name).join(', ')} (${configured.length}/${configs.length})`
  );
}
