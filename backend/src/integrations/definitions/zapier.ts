import { IntegrationDefinition } from '../../types/integrations';

export const zapierIntegration: IntegrationDefinition = {
  id: 'zapier',
  displayName: 'Zapier (via webhook)',
  description: 'Zapier Webhook integration (Not yet implemented)',
  authType: 'none',
  baseUrl: 'https://hooks.zapier.com/hooks/catch',
  status: 'stubbed',
  triggers: [
    {
      name: 'Any Trigger',
      event: 'any_trigger',
      description: 'Triggered by any system event to pass to Zapier',
    },
  ],
  actions: [
    {
      name: 'Send Structured Payload',
      description: 'Send a structured payload to a Zapier webhook URL',
      inputSchema: [
        { name: 'webhookUrl', type: 'string', required: true, description: 'Zapier webhook URL' },
        { name: 'payload', type: 'object', required: true, description: 'Structured JSON payload' },
      ],
      outputDescription: 'Delivery status',
    }
  ],
  payloadShape: {
    id: 'string',
  },
};
