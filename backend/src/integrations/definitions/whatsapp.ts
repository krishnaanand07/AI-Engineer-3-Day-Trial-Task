import { IntegrationDefinition } from '../../types/integrations';

export const whatsappIntegration: IntegrationDefinition = {
  id: 'whatsapp',
  displayName: 'WhatsApp (Twilio)',
  description: 'Send WhatsApp messages, template notifications, and OTP via Twilio.',
  authType: 'api_key',
  baseUrl: 'https://api.twilio.com/2010-04-01',
  triggers: [
    { name: 'on_message_received', event: 'create', description: 'Triggered when an inbound WhatsApp message is received' },
    { name: 'on_delivery_status', event: 'update', description: 'Triggered when message delivery status changes' },
  ],
  actions: [
    {
      name: 'send_template_message',
      description: 'Send a WhatsApp template message (pre-approved by Meta)',
      inputSchema: [
        { name: 'to', type: 'phone', required: true, description: 'Recipient phone number (E.164 format)' },
        { name: 'template_name', type: 'string', required: true, description: 'Template name' },
        { name: 'template_params', type: 'json', required: false, description: 'Template parameter values' },
      ],
      outputDescription: 'Returns message SID and status',
    },
    {
      name: 'send_message',
      description: 'Send a free-form WhatsApp message (within 24h window)',
      inputSchema: [
        { name: 'to', type: 'phone', required: true, description: 'Recipient phone number' },
        { name: 'body', type: 'string', required: true, description: 'Message body text' },
        { name: 'media_url', type: 'url', required: false, description: 'URL to media attachment' },
      ],
      outputDescription: 'Returns message SID and delivery status',
    },
    {
      name: 'send_otp',
      description: 'Send an OTP verification code via WhatsApp',
      inputSchema: [
        { name: 'to', type: 'phone', required: true, description: 'Recipient phone number' },
        { name: 'code', type: 'string', required: true, description: 'OTP code to send' },
      ],
      outputDescription: 'Returns delivery confirmation',
    },
  ],
  payloadShape: {
    To: 'whatsapp:+1234567890',
    From: 'whatsapp:+0987654321',
    Body: 'string',
    MediaUrl: 'string (optional)',
  },
  status: 'implemented',
};
