import { DataSchema } from '../../types/dataSchema';
import { AppIntent } from '../../types/appIntent';

// ============================================================
// AppSpec Generation Prompt — Stage 3
// ============================================================

export function buildAppSpecPrompt(
  appIntent: AppIntent,
  dataSchema: DataSchema
): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are an expert full-stack architect AI. Your task is to generate a complete AppSpec from an AppIntent and DataSchema.

RULES:
1. Output ONLY valid JSON. No markdown, no explanations, no code blocks.
2. Every page MUST have at least 1 corresponding API endpoint.
3. Every entity referenced in pages must exist in the DataSchema.
4. Auth roles must be consistent — roles in permissions must be defined in the roles array.
5. Integration hooks must reference valid integration IDs: slack, stripe, whatsapp, webhook, salesforce, gmail, github.
6. Workflow stubs must reference valid entities from the DataSchema.
7. Pages should have sensible routes (e.g., /properties, /properties/:id).

OUTPUT SCHEMA:
{
  "appName": "string",
  "appType": "string",
  "pages": [
    {
      "name": "Page Name",
      "route": "/route",
      "layout": "list|detail|dashboard|settings|form|auth",
      "entity": "EntityName (optional)",
      "components": ["table", "form", "chart", "card", "stats"],
      "description": "What this page does",
      "requiresAuth": true
    }
  ],
  "apiEndpoints": [
    {
      "path": "/api/resource",
      "method": "GET|POST|PUT|PATCH|DELETE",
      "handler": "Description of what this endpoint does",
      "entity": "EntityName (optional)",
      "authRequired": true,
      "rateLimit": false,
      "description": "Endpoint description"
    }
  ],
  "authRules": {
    "roles": [
      {
        "name": "admin",
        "description": "Full access",
        "permissions": [
          { "entity": "EntityName", "read": true, "write": true, "delete": true }
        ]
      }
    ],
    "defaultRole": "user"
  },
  "integrationHooks": [
    {
      "integrationId": "slack",
      "trigger": "entity.event",
      "action": "send_notification",
      "description": "What this hook does"
    }
  ],
  "workflowStubs": [
    {
      "name": "Workflow Name",
      "trigger": {
        "entity": "EntityName",
        "event": "create|update|delete|status_change",
        "condition": "optional condition"
      },
      "integrationId": "slack",
      "action": "send_message",
      "payloadMapping": { "field": "mapping" },
      "description": "What this workflow does"
    }
  ]
}`;

  const entitySummary = dataSchema.entities
    .map(
      (e) =>
        `  - ${e.name} (${e.tableName}): ${e.fields.map((f) => f.name).join(', ')} | Relations: ${e.relations.map((r) => `${r.type} ${r.target}`).join(', ') || 'None'}`
    )
    .join('\n');

  const userPrompt = `Generate the AppSpec for this application:

App Name: ${appIntent.appName}
App Type: ${appIntent.appType}
Description: ${appIntent.description}
Features: ${appIntent.features.join(', ')}
Integrations: ${appIntent.integrations_requested.join(', ') || 'None'}

DataSchema Entities:
${entitySummary}

Generate a complete AppSpec with:
1. Pages for each entity (list + detail views at minimum) plus a dashboard
2. CRUD API endpoints for each entity
3. Auth rules with at least admin and user roles
4. Integration hooks for any requested integrations
5. Workflow stubs that connect entities to integrations`;

  return { systemPrompt, userPrompt };
}
