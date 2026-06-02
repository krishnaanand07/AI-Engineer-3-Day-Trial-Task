// ============================================================
// Integration Registry Types
// ============================================================

export type AuthType = 'oauth2' | 'api_key' | 'webhook_secret' | 'none';

export type IntegrationStatus = 'implemented' | 'stubbed';

export interface TriggerDescriptor {
  name: string;
  event: string;
  entity?: string;
  description: string;
}

export interface ActionInputField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ActionDescriptor {
  name: string;
  description: string;
  inputSchema: ActionInputField[];
  outputDescription: string;
}

export interface PayloadShape {
  [key: string]: string | PayloadShape;
}

export interface IntegrationDefinition {
  id: string;
  displayName: string;
  description: string;
  authType: AuthType;
  baseUrl: string;
  triggers: TriggerDescriptor[];
  actions: ActionDescriptor[];
  payloadShape: PayloadShape;
  status: IntegrationStatus;
}
