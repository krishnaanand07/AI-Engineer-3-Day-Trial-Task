import { AppSpec, AppSpecSchema } from '../types/appSpec';
import { DataSchema } from '../types/dataSchema';

// ============================================================
// AppSpec Validator — Stage 3 Validation
// ============================================================

/**
 * Validate an AppSpec object against the DataSchema.
 * Returns an array of error strings. Empty array = valid.
 */
export function validateAppSpec(
  appSpec: AppSpec | null | undefined,
  dataSchema?: DataSchema
): string[] {
  const errors: string[] = [];

  if (!appSpec) {
    errors.push('AppSpec is null or undefined');
    return errors;
  }

  // Zod validation
  const result = AppSpecSchema.safeParse(appSpec);
  if (!result.success) {
    for (const err of result.error.errors) {
      errors.push(`${err.path.join('.')}: ${err.message}`);
    }
    return errors;
  }

  const spec = result.data;

  // Collect entity names from DataSchema (if provided)
  const entityNames = dataSchema
    ? new Set(dataSchema.entities.map((e) => e.name))
    : null;

  // ─── Page–API consistency ───
  // Every page should have at least one corresponding API endpoint
  for (const page of spec.pages) {
    if (page.entity) {
      const hasEndpoint = spec.apiEndpoints.some(
        (ep) => ep.entity === page.entity
      );
      if (!hasEndpoint) {
        errors.push(
          `Page '${page.name}': bound to entity '${page.entity}' but no API endpoint serves this entity`
        );
      }
    }
  }

  // ─── Entity reference validation ───
  if (entityNames) {
    // Check page entity references
    for (const page of spec.pages) {
      if (page.entity && !entityNames.has(page.entity)) {
        errors.push(
          `Page '${page.name}': references entity '${page.entity}' which doesn't exist in DataSchema`
        );
      }
    }

    // Check API endpoint entity references
    for (const ep of spec.apiEndpoints) {
      if (ep.entity && !entityNames.has(ep.entity)) {
        errors.push(
          `API '${ep.method} ${ep.path}': references entity '${ep.entity}' which doesn't exist in DataSchema`
        );
      }
    }

    // Check workflow stub entity references
    for (const wf of spec.workflowStubs) {
      if (!entityNames.has(wf.trigger.entity)) {
        errors.push(
          `Workflow '${wf.name}': trigger entity '${wf.trigger.entity}' doesn't exist in DataSchema`
        );
      }
    }
  }

  // ─── Auth rule validation ───
  const roleNames = new Set(spec.authRules.roles.map((r) => r.name));

  // Default role must be defined
  if (!roleNames.has(spec.authRules.defaultRole)) {
    errors.push(
      `authRules: defaultRole '${spec.authRules.defaultRole}' is not defined in roles`
    );
  }

  // Check permissions reference valid entities
  if (entityNames) {
    for (const role of spec.authRules.roles) {
      for (const perm of role.permissions) {
        if (!entityNames.has(perm.entity)) {
          errors.push(
            `authRules: role '${role.name}' has permission for entity '${perm.entity}' which doesn't exist`
          );
        }
      }
    }
  }

  // ─── Integration hook validation ───
  const validIntegrationIds = new Set([
    'slack', 'stripe', 'whatsapp', 'webhook', 'salesforce', 'gmail', 'github',
  ]);
  for (const hook of spec.integrationHooks) {
    if (!validIntegrationIds.has(hook.integrationId)) {
      errors.push(
        `IntegrationHook: references unknown integrationId '${hook.integrationId}'`
      );
    }
  }

  // Workflow stubs integration validation
  for (const wf of spec.workflowStubs) {
    if (!validIntegrationIds.has(wf.integrationId)) {
      errors.push(
        `Workflow '${wf.name}': references unknown integrationId '${wf.integrationId}'`
      );
    }
  }

  return errors;
}
