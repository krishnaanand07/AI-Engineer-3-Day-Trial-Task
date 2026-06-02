import { z } from 'zod';

// ============================================================
// AppSpec — Output of Stage 3: AppSpec Generation
// ============================================================

export const LayoutTypeEnum = z.enum([
  'list',
  'detail',
  'dashboard',
  'settings',
  'form',
  'auth',
]);

export const ComponentTypeEnum = z.enum([
  'table',
  'form',
  'chart',
  'card',
  'stats',
  'calendar',
  'kanban',
  'map',
  'search',
  'list',
  'gallery',
  'filter',
]);

export const HttpMethodEnum = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
]);

// --- Page Definition ---
export const PageSchema = z.object({
  name: z.string().min(1),
  route: z.string().min(1),
  layout: LayoutTypeEnum,
  entity: z.string().nullish(),
  components: z.array(ComponentTypeEnum).min(1),
  description: z.string().nullish(),
  requiresAuth: z.boolean().default(true),
});

export type Page = z.infer<typeof PageSchema>;

// --- API Endpoint Definition ---
export const ApiEndpointSchema = z.object({
  path: z.string().min(1),
  method: HttpMethodEnum,
  handler: z.string().min(1),
  entity: z.string().nullish(),
  authRequired: z.boolean().default(true),
  rateLimit: z.boolean().default(false),
  description: z.string().nullish(),
});

export type ApiEndpoint = z.infer<typeof ApiEndpointSchema>;

// --- Auth Rules ---
export const PermissionSchema = z.object({
  entity: z.string().min(1),
  read: z.boolean().default(false),
  write: z.boolean().default(false),
  delete: z.boolean().default(false),
});

export const RoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
  permissions: z.array(PermissionSchema),
});

export type Role = z.infer<typeof RoleSchema>;

export const AuthRulesSchema = z.object({
  roles: z.array(RoleSchema).min(1),
  defaultRole: z.string().min(1),
});

export type AuthRules = z.infer<typeof AuthRulesSchema>;

// --- Integration Hook ---
export const IntegrationHookSchema = z.object({
  integrationId: z.string().min(1),
  trigger: z.string().min(1),
  action: z.string().min(1),
  description: z.string().nullish(),
});

export type IntegrationHook = z.infer<typeof IntegrationHookSchema>;

// --- Workflow Stub ---
export const WorkflowStubSchema = z.object({
  name: z.string().min(1),
  trigger: z.object({
    entity: z.string().min(1),
    event: z.enum(['create', 'update', 'delete', 'status_change']),
    condition: z.string().nullish(),
  }),
  integrationId: z.string().min(1),
  action: z.string().min(1),
  payloadMapping: z.record(z.string(), z.string()).default({}),
  description: z.string().nullish(),
});

export type WorkflowStub = z.infer<typeof WorkflowStubSchema>;

// --- Full AppSpec ---
export const AppSpecSchema = z.object({
  appName: z.string().min(1),
  appType: z.string().min(1),
  pages: z.array(PageSchema).min(1, 'At least one page is required'),
  apiEndpoints: z.array(ApiEndpointSchema).min(1, 'At least one API endpoint is required'),
  authRules: AuthRulesSchema,
  integrationHooks: z.array(IntegrationHookSchema).default([]),
  workflowStubs: z.array(WorkflowStubSchema).default([]),
});

export type AppSpec = z.infer<typeof AppSpecSchema>;
