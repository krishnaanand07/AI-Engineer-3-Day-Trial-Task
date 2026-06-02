import { z } from 'zod';

// ============================================================
// AppIntent — Output of Stage 1: Intent Extraction
// ============================================================

export const AppTypeEnum = z.enum([
  'crm',
  'ecommerce',
  'project_management',
  'inventory',
  'hr',
  'event_management',
  'saas',
  'custom',
]);

export type AppType = z.infer<typeof AppTypeEnum>;

export const AppIntentSchema = z.object({
  appName: z.string().min(1, 'App name is required'),
  appType: AppTypeEnum,
  description: z.string().min(1, 'Description is required'),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  entities: z.array(z.string()).min(1, 'At least one entity is required'),
  integrations_requested: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  clarification_required: z.boolean().default(false),
});

export type AppIntent = z.infer<typeof AppIntentSchema>;
