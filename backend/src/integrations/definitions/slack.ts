import { IntegrationDefinition } from '../../types/integrations';

// ============================================================
// Slack Integration — Fully Implemented
// ============================================================

export const slackIntegration: IntegrationDefinition = {
  id: 'slack',
  displayName: 'Slack',
  description: 'Send notifications, alerts, and messages to Slack channels and users.',
  authType: 'oauth2',
  baseUrl: 'https://slack.com/api',
  triggers: [
    {
      name: 'on_entity_created',
      event: 'create',
      description: 'Triggered when a new entity record is created',
    },
    {
      name: 'on_entity_updated',
      event: 'update',
      description: 'Triggered when an entity record is updated',
    },
    {
      name: 'on_status_change',
      event: 'status_change',
      description: 'Triggered when an entity status field changes',
    },
  ],
  actions: [
    {
      name: 'send_message',
      description: 'Send a message to a Slack channel',
      inputSchema: [
        { name: 'channel', type: 'string', required: true, description: 'Slack channel ID or name' },
        { name: 'text', type: 'string', required: true, description: 'Message text' },
        { name: 'blocks', type: 'json', required: false, description: 'Slack Block Kit blocks for rich formatting' },
      ],
      outputDescription: 'Returns message timestamp and channel ID',
    },
    {
      name: 'send_notification',
      description: 'Send a notification to a Slack user via DM',
      inputSchema: [
        { name: 'user_id', type: 'string', required: true, description: 'Slack user ID' },
        { name: 'text', type: 'string', required: true, description: 'Notification message' },
      ],
      outputDescription: 'Returns delivery confirmation',
    },
  ],
  payloadShape: {
    channel: 'string',
    text: 'string',
    blocks: 'Block[]',
    thread_ts: 'string (optional)',
  },
  status: 'implemented',
};
