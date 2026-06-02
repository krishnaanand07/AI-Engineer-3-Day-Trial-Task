import { IntegrationDefinition } from '../../types/integrations';

export const airtableIntegration: IntegrationDefinition = {
  id: 'airtable',
  displayName: 'Airtable',
  description: 'Airtable integration (Not yet implemented)',
  authType: 'oauth2',
  baseUrl: 'https://api.airtable.com/v0',
  status: 'stubbed',
  triggers: [
    {
      name: 'Record Event',
      event: 'record_event',
      description: 'Triggered via Airtable automation webhook',
    },
  ],
  actions: [
    {
      name: 'Create Record',
      description: 'Create a record in a table',
      inputSchema: [
        { name: 'baseId', type: 'string', required: true, description: 'ID of the Airtable base' },
        { name: 'tableId', type: 'string', required: true, description: 'ID or name of the table' },
        { name: 'fields', type: 'object', required: true, description: 'Record fields' },
      ],
      outputDescription: 'Created Airtable record',
    },
    {
      name: 'Update Field',
      description: 'Update fields of an existing record',
      inputSchema: [
        { name: 'baseId', type: 'string', required: true, description: 'ID of the Airtable base' },
        { name: 'tableId', type: 'string', required: true, description: 'ID or name of the table' },
        { name: 'recordId', type: 'string', required: true, description: 'ID of the record' },
        { name: 'fields', type: 'object', required: true, description: 'Fields to update' },
      ],
      outputDescription: 'Updated Airtable record',
    },
    {
      name: 'Trigger Automation',
      description: 'Trigger an Airtable automation via incoming webhook',
      inputSchema: [
        { name: 'webhookUrl', type: 'string', required: true, description: 'URL of the Airtable webhook' },
        { name: 'payload', type: 'object', required: true, description: 'Payload to send' },
      ],
      outputDescription: 'Status of automation trigger',
    }
  ],
  payloadShape: {
    record: {},
  },
};
