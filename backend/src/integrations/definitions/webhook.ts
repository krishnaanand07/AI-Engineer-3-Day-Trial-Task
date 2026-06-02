import { IntegrationDefinition } from '../../types/integrations';

export const webhookIntegration: IntegrationDefinition = {
  id: 'webhook',
  displayName: 'Webhook (Generic)',
  description: 'Universal HTTP webhook integration with HMAC signature verification.',
  authType: 'webhook_secret',
  baseUrl: '',
  triggers: [
    { name: 'on_entity_created', event: 'create', description: 'Triggered when any entity record is created' },
    { name: 'on_entity_updated', event: 'update', description: 'Triggered when any entity record is updated' },
    { name: 'on_entity_deleted', event: 'delete', description: 'Triggered when any entity record is deleted' },
    { name: 'on_status_change', event: 'status_change', description: 'Triggered when entity status changes' },
  ],
  actions: [
    {
      name: 'send_webhook',
      description: 'Send an HTTP POST request to a configured webhook URL',
      inputSchema: [
        { name: 'url', type: 'url', required: true, description: 'Webhook destination URL' },
        { name: 'payload', type: 'json', required: true, description: 'JSON payload to send' },
        { name: 'headers', type: 'json', required: false, description: 'Additional HTTP headers' },
        { name: 'secret', type: 'string', required: false, description: 'HMAC secret for signature' },
      ],
      outputDescription: 'Returns HTTP status code and response body',
    },
  ],
  payloadShape: {
    event: 'string',
    entity: 'string',
    data: '{ [key: string]: unknown }',
    timestamp: 'string (ISO 8601)',
    signature: 'string (HMAC-SHA256)',
  },
  status: 'implemented',
};
