import { IntegrationDefinition } from '../../types/integrations';

export const twilioSmsIntegration: IntegrationDefinition = {
  id: 'twilio-sms',
  displayName: 'Twilio SMS',
  description: 'Twilio SMS integration (Not yet implemented)',
  authType: 'api_key',
  baseUrl: 'https://api.twilio.com/2010-04-01',
  status: 'stubbed',
  triggers: [
    {
      name: 'User Action / Status Change',
      event: 'user_action',
      description: 'Internal event that requires SMS notification',
    },
  ],
  actions: [
    {
      name: 'Send SMS Notification',
      description: 'Send an SMS message',
      inputSchema: [
        { name: 'to', type: 'string', required: true, description: 'Recipient phone number' },
        { name: 'body', type: 'string', required: true, description: 'Message body' },
      ],
      outputDescription: 'Twilio message resource',
    },
    {
      name: 'Trigger OTP Flow',
      description: 'Send an OTP via Twilio Verify API',
      inputSchema: [
        { name: 'to', type: 'string', required: true, description: 'Recipient phone number' },
        { name: 'channel', type: 'string', required: false, description: 'sms or call' },
      ],
      outputDescription: 'Twilio verification status',
    }
  ],
  payloadShape: {
    SmsSid: 'string',
    SmsStatus: 'string',
  },
};
