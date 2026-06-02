import { IntegrationDefinition } from '../../types/integrations';

export const hubspotIntegration: IntegrationDefinition = {
  id: 'hubspot',
  displayName: 'HubSpot',
  description: 'HubSpot CRM integration (Not yet implemented)',
  authType: 'oauth2',
  baseUrl: 'https://api.hubapi.com',
  status: 'implemented',
  triggers: [
    {
      name: 'Contact or Deal Event',
      event: 'crm_event',
      description: 'Triggered when a contact or deal event occurs',
    },
  ],
  actions: [
    {
      name: 'Create/Update Contact',
      description: 'Create or update a contact in HubSpot',
      inputSchema: [
        { name: 'email', type: 'string', required: true, description: 'Contact email' },
        { name: 'properties', type: 'object', required: false, description: 'Additional properties' },
      ],
      outputDescription: 'Contact object from HubSpot',
    },
    {
      name: 'Add to Sequence',
      description: 'Add a contact to a HubSpot sequence',
      inputSchema: [
        { name: 'contactId', type: 'string', required: true, description: 'ID of the contact' },
        { name: 'sequenceId', type: 'string', required: true, description: 'ID of the sequence' },
      ],
      outputDescription: 'Sequence enrollment status',
    },
    {
      name: 'Update Deal Stage',
      description: 'Update the stage of a deal',
      inputSchema: [
        { name: 'dealId', type: 'string', required: true, description: 'ID of the deal' },
        { name: 'stageId', type: 'string', required: true, description: 'New stage ID' },
      ],
      outputDescription: 'Updated deal object',
    }
  ],
  payloadShape: {
    hubspotEvent: 'string',
    data: {},
  },
};
