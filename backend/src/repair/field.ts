// ============================================================
// Field Repair — Fix missing or wrongly-typed fields
// ============================================================

/**
 * Typed defaults for AppIntent fields.
 */
const INTENT_DEFAULTS: Record<string, unknown> = {
  appName: 'Untitled App',
  appType: 'custom',
  description: 'An application',
  features: ['Basic CRUD operations'],
  entities: ['User'],
  integrations_requested: [],
  assumptions: ['Generated with default values due to missing fields'],
  clarification_required: false,
};

/**
 * Typed defaults for Entity fields.
 */
const ENTITY_FIELD_DEFAULTS: Record<string, unknown> = {
  nullable: false,
  isPrimary: false,
  isUnique: false,
  isRelation: false,
};

/**
 * Typed defaults for Relation fields.
 */
const RELATION_DEFAULTS: Record<string, unknown> = {
  onDelete: 'CASCADE',
};

/**
 * Typed defaults for AppSpec sub-fields.
 */
const PAGE_DEFAULTS: Record<string, unknown> = {
  requiresAuth: true,
  components: ['table'],
  layout: 'list',
};

const ENDPOINT_DEFAULTS: Record<string, unknown> = {
  authRequired: true,
  rateLimit: false,
  method: 'GET',
};

/**
 * Attempt to fix missing or wrongly-typed fields in a JSON object.
 * Purely rule-based — no AI re-prompts.
 */
export function repairFields(
  obj: Record<string, unknown>,
  schemaType: 'intent' | 'schema' | 'appSpec'
): {
  repaired: Record<string, unknown>;
  fieldsFixed: string[];
} {
  const fieldsFixed: string[] = [];

  if (schemaType === 'intent') {
    // Fix missing top-level intent fields
    for (const [key, defaultVal] of Object.entries(INTENT_DEFAULTS)) {
      if (obj[key] === undefined || obj[key] === null) {
        obj[key] = defaultVal;
        fieldsFixed.push(`Added default for '${key}'`);
      }
    }
    // Type coercion
    if (typeof obj['clarification_required'] === 'string') {
      obj['clarification_required'] = obj['clarification_required'] === 'true';
      fieldsFixed.push("Coerced 'clarification_required' from string to boolean");
    }
    // Ensure arrays are arrays
    for (const field of ['features', 'entities', 'integrations_requested', 'assumptions']) {
      if (obj[field] && !Array.isArray(obj[field])) {
        obj[field] = [String(obj[field])];
        fieldsFixed.push(`Wrapped '${field}' in array`);
      }
    }
  }

  if (schemaType === 'schema') {
    // Ensure entities is an array
    if (obj['entities'] && !Array.isArray(obj['entities'])) {
      obj['entities'] = [obj['entities']];
      fieldsFixed.push("Wrapped 'entities' in array");
    }
    // Fix each entity
    if (Array.isArray(obj['entities'])) {
      for (const entity of obj['entities'] as Record<string, unknown>[]) {
        if (!entity['tableName'] && entity['name']) {
          // Auto-generate snake_case table name
          entity['tableName'] = String(entity['name'])
            .replace(/([A-Z])/g, '_$1')
            .toLowerCase()
            .replace(/^_/, '')
            .replace(/ /g, '_');
          fieldsFixed.push(`Generated tableName for '${entity['name']}'`);
        }
        // Fix fields within each entity
        if (Array.isArray(entity['fields'])) {
          for (const field of entity['fields'] as Record<string, unknown>[]) {
            for (const [key, defaultVal] of Object.entries(ENTITY_FIELD_DEFAULTS)) {
              if (field[key] === undefined || field[key] === null) {
                field[key] = defaultVal;
              }
            }
            // Coerce boolean strings
            for (const boolField of ['nullable', 'isPrimary', 'isUnique', 'isRelation']) {
              if (typeof field[boolField] === 'string') {
                field[boolField] = field[boolField] === 'true';
              }
            }
          }
        }
        // Fix relations
        if (Array.isArray(entity['relations'])) {
          for (const relation of entity['relations'] as Record<string, unknown>[]) {
            for (const [key, defaultVal] of Object.entries(RELATION_DEFAULTS)) {
              if (relation[key] === undefined || relation[key] === null) {
                relation[key] = defaultVal;
              }
            }
            if (relation['onDelete'] === 'SET NULL') {
              relation['onDelete'] = 'SET_NULL';
              fieldsFixed.push("Fixed relation onDelete 'SET NULL' to 'SET_NULL'");
            }
          }
        } else {
          entity['relations'] = [];
        }
      }
    }
  }

  if (schemaType === 'appSpec') {
    // Fix pages
    if (!Array.isArray(obj['pages']) || obj['pages'].length === 0) {
      obj['pages'] = [{
        name: 'Home',
        route: '/',
        layout: 'dashboard',
        components: ['card'],
        requiresAuth: false,
      }];
      fieldsFixed.push("Added default 'Home' page to empty pages array");
    }
    
    if (Array.isArray(obj['pages'])) {
      for (const page of obj['pages'] as Record<string, unknown>[]) {
        for (const [key, defaultVal] of Object.entries(PAGE_DEFAULTS)) {
          if (page[key] === undefined || page[key] === null) {
            page[key] = defaultVal;
            fieldsFixed.push(`Page '${page['name']}': added default '${key}'`);
          }
        }
        if (typeof page['requiresAuth'] === 'string') {
          page['requiresAuth'] = page['requiresAuth'] === 'true';
          fieldsFixed.push(`Page '${page['name']}': coerced requiresAuth to boolean`);
        }
        const validLayouts = ['list', 'detail', 'dashboard', 'settings', 'form', 'auth'];
        if (typeof page['layout'] !== 'string' || !validLayouts.includes(page['layout'] as string)) {
          page['layout'] = 'list';
          fieldsFixed.push(`Page '${page['name']}': reset invalid layout to 'list'`);
        }
        if (!Array.isArray(page['components']) || page['components'].length === 0) {
          page['components'] = ['card'];
          fieldsFixed.push(`Page '${page['name']}': added default 'card' to empty components`);
        } else {
          const validComponents = ['table', 'form', 'chart', 'card', 'stats', 'calendar', 'kanban', 'map', 'search', 'list', 'gallery'];
          const newComponents = [];
          let changed = false;
          for (const comp of page['components']) {
            if (typeof comp === 'string' && !validComponents.includes(comp)) {
              newComponents.push('card');
              changed = true;
              fieldsFixed.push(`Replaced invalid component '${comp}' with 'card'`);
            } else {
              newComponents.push(comp);
            }
          }
          if (changed) page['components'] = newComponents;
        }
      }
    }

    // Fix API endpoints
    if (!Array.isArray(obj['apiEndpoints']) || obj['apiEndpoints'].length === 0) {
      obj['apiEndpoints'] = [{
        path: '/api/health',
        method: 'GET',
        handler: 'Health check',
        authRequired: false,
        rateLimit: false,
      }];
      fieldsFixed.push("Added default '/api/health' endpoint to empty apiEndpoints array");
    }
    
    if (Array.isArray(obj['apiEndpoints'])) {
      for (const ep of obj['apiEndpoints'] as Record<string, unknown>[]) {
        for (const [key, defaultVal] of Object.entries(ENDPOINT_DEFAULTS)) {
          if (ep[key] === undefined || ep[key] === null) {
            ep[key] = defaultVal;
            fieldsFixed.push(`Endpoint '${ep['path']}': added default '${key}'`);
          }
        }
        for (const boolKey of ['authRequired', 'rateLimit']) {
          if (typeof ep[boolKey] === 'string') {
            ep[boolKey] = ep[boolKey] === 'true';
            fieldsFixed.push(`Endpoint '${ep['path']}': coerced ${boolKey} to boolean`);
          }
        }
        const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
        if (typeof ep['method'] !== 'string' || !validMethods.includes((ep['method'] as string).toUpperCase())) {
          ep['method'] = 'GET';
          fieldsFixed.push(`Endpoint '${ep['path']}': reset invalid method to GET`);
        } else {
          ep['method'] = (ep['method'] as string).toUpperCase();
        }
      }
    }
    // Ensure arrays exist
    for (const arrayField of ['integrationHooks', 'workflowStubs']) {
      if (!Array.isArray(obj[arrayField])) {
        obj[arrayField] = [];
        fieldsFixed.push(`Added empty array for '${arrayField}'`);
      }
    }
    // Ensure authRules exists
    if (!obj['authRules'] || typeof obj['authRules'] !== 'object') {
      obj['authRules'] = {
        roles: [
          {
            name: 'admin',
            description: 'Full access to all resources',
            permissions: [],
          },
          {
            name: 'user',
            description: 'Standard user access',
            permissions: [],
          },
        ],
        defaultRole: 'user',
      };
      fieldsFixed.push('Added default authRules');
    }
  }

  return { repaired: obj, fieldsFixed };
}
