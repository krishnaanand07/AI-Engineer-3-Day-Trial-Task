import { IntegrationDefinition } from '../../types/integrations';

export const gmailIntegration: IntegrationDefinition = {
  id: 'gmail',
  displayName: 'Gmail / Google Workspace',
  description: 'Send emails and manage Google Workspace communications.',
  authType: 'oauth2',
  baseUrl: 'https://gmail.googleapis.com/gmail/v1',
  triggers: [
    { name: 'on_email_received', event: 'create', description: 'Triggered when a new email is received' },
  ],
  actions: [
    {
      name: 'send_email',
      description: 'Send an email via Gmail',
      inputSchema: [
        { name: 'to', type: 'email', required: true, description: 'Recipient email address' },
        { name: 'subject', type: 'string', required: true, description: 'Email subject' },
        { name: 'body', type: 'string', required: true, description: 'Email body (HTML supported)' },
      ],
      outputDescription: 'Returns message ID',
    },
  ],
  payloadShape: {
    to: 'string',
    subject: 'string',
    body: 'string',
  },
  status: 'implemented',
};
