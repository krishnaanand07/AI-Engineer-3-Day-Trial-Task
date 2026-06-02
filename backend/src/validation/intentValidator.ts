import { AppIntent, AppIntentSchema } from '../types/appIntent';

// ============================================================
// Intent Validator — Stage 1 Validation
// ============================================================

/**
 * Validate an AppIntent object.
 * Returns an array of error strings. Empty array = valid.
 */
export function validateIntent(appIntent: AppIntent | null | undefined): string[] {
  const errors: string[] = [];

  if (!appIntent) {
    errors.push('AppIntent is null or undefined');
    return errors;
  }

  // Zod validation
  const result = AppIntentSchema.safeParse(appIntent);
  if (!result.success) {
    for (const err of result.error.errors) {
      errors.push(`${err.path.join('.')}: ${err.message}`);
    }
    return errors;
  }

  // Semantic validation
  if (appIntent.features.length === 0) {
    errors.push('features: must have at least one feature');
  }

  if (appIntent.entities.length === 0) {
    errors.push('entities: must have at least one entity');
  }

  if (!appIntent.appName || appIntent.appName.trim().length === 0) {
    errors.push('appName: must not be empty');
  }

  if (!appIntent.description || appIntent.description.trim().length < 5) {
    errors.push('description: must be at least 5 characters');
  }

  return errors;
}
