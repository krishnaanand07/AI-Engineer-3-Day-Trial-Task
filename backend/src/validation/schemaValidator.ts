import { DataSchema, DataSchemaSchema } from '../types/dataSchema';

// ============================================================
// Schema Validator — Stage 2 Validation
// ============================================================

/**
 * Validate a DataSchema object.
 * Returns an array of error strings. Empty array = valid.
 */
export function validateSchema(dataSchema: DataSchema | null | undefined): string[] {
  const errors: string[] = [];

  if (!dataSchema) {
    errors.push('DataSchema is null or undefined');
    return errors;
  }

  // Zod validation
  const result = DataSchemaSchema.safeParse(dataSchema);
  if (!result.success) {
    for (const err of result.error.errors) {
      errors.push(`${err.path.join('.')}: ${err.message}`);
    }
    return errors;
  }

  const schema = result.data;

  // Collect all entity names for reference checking
  const entityNames = new Set(schema.entities.map((e) => e.name));

  for (const entity of schema.entities) {
    // Check tenantId presence
    const hasTenantId = entity.fields.some((f) => f.name === 'tenantId');
    if (!hasTenantId) {
      errors.push(`${entity.name}: missing required 'tenantId' field`);
    }

    // Check id field
    const hasId = entity.fields.some((f) => f.name === 'id' && f.isPrimary);
    if (!hasId) {
      errors.push(`${entity.name}: missing required 'id' primary key field`);
    }

    // Check table name is snake_case
    if (!/^[a-z][a-z0-9_]*$/.test(entity.tableName)) {
      errors.push(`${entity.name}: tableName '${entity.tableName}' is not snake_case`);
    }

    // Check relations reference valid entities
    for (const relation of entity.relations) {
      if (!entityNames.has(relation.target)) {
        errors.push(
          `${entity.name}: relation target '${relation.target}' does not exist in schema`
        );
      }
    }

    // Check bidirectional relation consistency
    for (const relation of entity.relations) {
      if (relation.type === 'hasMany') {
        // The target entity should have a belongsTo back to this entity
        const targetEntity = schema.entities.find((e) => e.name === relation.target);
        if (targetEntity) {
          const hasBelongsTo = targetEntity.relations.some(
            (r) => r.type === 'belongsTo' && r.target === entity.name
          );
          if (!hasBelongsTo) {
            // This is a warning, not a hard error — AI often misses this
            errors.push(
              `${entity.name}: hasMany → ${relation.target} but ${relation.target} has no belongsTo → ${entity.name} (bidirectional consistency)`
            );
          }
        }
      }
    }
  }

  return errors;
}
