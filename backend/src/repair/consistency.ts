// ============================================================
// Consistency Repair — Fix cross-layer reference breaks
// ============================================================

/**
 * Fuzzy match a name against a set of known names.
 * Returns the best match or null.
 */
function fuzzyMatch(target: string, candidates: string[]): string | null {
  if (candidates.length === 0) return null;

  const normalized = target.toLowerCase().replace(/[_\-\s]/g, '');

  // Exact match (case-insensitive)
  for (const c of candidates) {
    if (c.toLowerCase() === target.toLowerCase()) return c;
  }

  // Normalized match
  for (const c of candidates) {
    if (c.toLowerCase().replace(/[_\-\s]/g, '') === normalized) return c;
  }

  // Substring match — if target contains candidate or vice versa
  for (const c of candidates) {
    const cNorm = c.toLowerCase().replace(/[_\-\s]/g, '');
    if (cNorm.includes(normalized) || normalized.includes(cNorm)) return c;
  }

  // Prefix match
  for (const c of candidates) {
    const cNorm = c.toLowerCase();
    if (cNorm.startsWith(normalized.substring(0, 3)) || normalized.startsWith(cNorm.substring(0, 3))) {
      return c;
    }
  }

  return null;
}

/**
 * Valid integration IDs in our registry.
 */
const VALID_INTEGRATION_IDS = [
  'slack', 'stripe', 'whatsapp', 'webhook', 'salesforce', 'gmail', 'github',
];

/**
 * Repair cross-layer reference breaks in an AppSpec.
 * Purely deterministic — fuzzy matching, removal of invalid stubs.
 */
export function repairConsistency(
  obj: Record<string, unknown>,
  entityNames: string[]
): {
  repaired: Record<string, unknown>;
  fixesApplied: string[];
} {
  const fixes: string[] = [];

  // ─── Fix page entity references ───
  if (Array.isArray(obj['pages'])) {
    for (const page of obj['pages'] as Record<string, unknown>[]) {
      if (page['entity'] && typeof page['entity'] === 'string') {
        if (!entityNames.includes(page['entity'] as string)) {
          const match = fuzzyMatch(page['entity'] as string, entityNames);
          if (match) {
            fixes.push(`Page '${page['name']}': fixed entity '${page['entity']}' → '${match}'`);
            page['entity'] = match;
          } else {
            fixes.push(`Page '${page['name']}': removed invalid entity reference '${page['entity']}'`);
            delete page['entity'];
          }
        }
      }
    }
  }

  // ─── Fix API endpoint entity references ───
  if (Array.isArray(obj['apiEndpoints'])) {
    for (const ep of obj['apiEndpoints'] as Record<string, unknown>[]) {
      if (ep['entity'] && typeof ep['entity'] === 'string') {
        if (!entityNames.includes(ep['entity'] as string)) {
          const match = fuzzyMatch(ep['entity'] as string, entityNames);
          if (match) {
            fixes.push(`API '${ep['path']}': fixed entity '${ep['entity']}' → '${match}'`);
            ep['entity'] = match;
          } else {
            fixes.push(`API '${ep['path']}': removed invalid entity reference '${ep['entity']}'`);
            delete ep['entity'];
          }
        }
      }
    }
  }

  // ─── Fix workflow stub references ───
  if (Array.isArray(obj['workflowStubs'])) {
    const validWorkflows: Record<string, unknown>[] = [];
    for (const wf of obj['workflowStubs'] as Record<string, unknown>[]) {
      let valid = true;

      // Fix entity reference
      const trigger = wf['trigger'] as Record<string, unknown> | undefined;
      if (trigger?.['entity'] && typeof trigger['entity'] === 'string') {
        if (!entityNames.includes(trigger['entity'] as string)) {
          const match = fuzzyMatch(trigger['entity'] as string, entityNames);
          if (match) {
            fixes.push(`Workflow '${wf['name']}': fixed trigger entity '${trigger['entity']}' → '${match}'`);
            trigger['entity'] = match;
          } else {
            fixes.push(`Workflow '${wf['name']}': removed — invalid trigger entity '${trigger['entity']}'`);
            valid = false;
          }
        }
      }

      // Fix integration ID
      if (wf['integrationId'] && typeof wf['integrationId'] === 'string') {
        if (!VALID_INTEGRATION_IDS.includes(wf['integrationId'] as string)) {
          const match = fuzzyMatch(wf['integrationId'] as string, VALID_INTEGRATION_IDS);
          if (match) {
            fixes.push(`Workflow '${wf['name']}': fixed integrationId '${wf['integrationId']}' → '${match}'`);
            wf['integrationId'] = match;
          } else {
            fixes.push(`Workflow '${wf['name']}': removed — invalid integrationId '${wf['integrationId']}'`);
            valid = false;
          }
        }
      }

      if (valid) {
        validWorkflows.push(wf);
      }
    }
    obj['workflowStubs'] = validWorkflows;
  }

  // ─── Fix integration hook references ───
  if (Array.isArray(obj['integrationHooks'])) {
    const validHooks: Record<string, unknown>[] = [];
    for (const hook of obj['integrationHooks'] as Record<string, unknown>[]) {
      if (hook['integrationId'] && typeof hook['integrationId'] === 'string') {
        if (!VALID_INTEGRATION_IDS.includes(hook['integrationId'] as string)) {
          const match = fuzzyMatch(hook['integrationId'] as string, VALID_INTEGRATION_IDS);
          if (match) {
            fixes.push(`IntegrationHook: fixed integrationId '${hook['integrationId']}' → '${match}'`);
            hook['integrationId'] = match;
            validHooks.push(hook);
          } else {
            fixes.push(`IntegrationHook: removed — invalid integrationId '${hook['integrationId']}'`);
          }
        } else {
          validHooks.push(hook);
        }
      }
    }
    obj['integrationHooks'] = validHooks;
  }

  // ─── Fix auth rule entity references ───
  if (obj['authRules'] && typeof obj['authRules'] === 'object') {
    const authRules = obj['authRules'] as Record<string, unknown>;
    if (Array.isArray(authRules['roles'])) {
      for (const role of authRules['roles'] as Record<string, unknown>[]) {
        if (Array.isArray(role['permissions'])) {
          for (const perm of role['permissions'] as Record<string, unknown>[]) {
            if (perm['entity'] && typeof perm['entity'] === 'string') {
              if (!entityNames.includes(perm['entity'] as string)) {
                const match = fuzzyMatch(perm['entity'] as string, entityNames);
                if (match) {
                  fixes.push(`Auth role '${role['name']}': fixed entity '${perm['entity']}' → '${match}'`);
                  perm['entity'] = match;
                }
              }
            }
          }
        }
      }
    }
  }

  return { repaired: obj, fixesApplied: fixes };
}
