import { AppIntent } from '../../types/appIntent';

// ============================================================
// Schema Generation Prompt — Stage 2
// ============================================================

export function buildSchemaGenerationPrompt(appIntent: AppIntent): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are an expert database architect AI. Your task is to generate a complete DataSchema from an AppIntent.

RULES:
1. Output ONLY valid JSON. No markdown, no explanations, no code blocks.
2. Every entity MUST have a "tenantId" field of type "uuid" (for multi-tenancy).
3. Every entity MUST have an "id" field of type "uuid" as primary key.
4. Every entity MUST have "createdAt" and "updatedAt" fields of type "datetime".
5. Table names MUST be snake_case (e.g., "order_items", not "OrderItems").
6. Relations MUST be bidirectional: if Entity A hasMany Entity B, then Entity B must belongsTo Entity A.
7. Use appropriate field types: string, text, number, integer, float, boolean, date, datetime, email, url, phone, enum, json, uuid.
8. For enum fields, provide "enumValues" array.

OUTPUT SCHEMA:
{
  "entities": [
    {
      "name": "EntityName",
      "tableName": "entity_name",
      "description": "What this entity represents",
      "fields": [
        { "name": "id", "type": "uuid", "isPrimary": true, "nullable": false, "isUnique": true, "isRelation": false },
        { "name": "tenantId", "type": "uuid", "nullable": false, "isPrimary": false, "isUnique": false, "isRelation": false },
        { "name": "fieldName", "type": "string", "nullable": false, "isPrimary": false, "isUnique": false, "isRelation": false }
      ],
      "relations": [
        { "type": "hasMany", "target": "OtherEntity", "foreignKey": "entity_name_id", "onDelete": "CASCADE" }
      ]
    }
  ]
}`;

  const userPrompt = `Generate the DataSchema for this application:

App Name: ${appIntent.appName}
App Type: ${appIntent.appType}
Description: ${appIntent.description}
Entities Identified: ${appIntent.entities.join(', ')}
Features: ${appIntent.features.join(', ')}
Integrations: ${appIntent.integrations_requested.join(', ') || 'None'}

Create all entities with proper fields, relations, and ensure:
- Every entity has id (uuid, primary), tenantId (uuid), createdAt, updatedAt
- All table names are snake_case
- Relations are bidirectional
- Field types are appropriate for the data`;

  return { systemPrompt, userPrompt };
}
