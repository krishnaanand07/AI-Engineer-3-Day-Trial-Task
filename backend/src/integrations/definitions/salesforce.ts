import { IntegrationDefinition } from '../../types/integrations';

export const salesforceIntegration: IntegrationDefinition = {
  id: 'salesforce',
  displayName: 'Salesforce',
  description: 'Sync CRM data, manage leads, contacts, and opportunities with Salesforce.',
  authType: 'oauth2',
  baseUrl: 'https://login.salesforce.com/services/data/v59.0',
  triggers: [
    { name: 'on_lead_created', event: 'create', entity: 'Lead', description: 'Triggered when a new lead is created' },
    { name: 'on_opportunity_updated', event: 'update', entity: 'Opportunity', description: 'Triggered when an opportunity is updated' },
    { name: 'on_deal_closed', event: 'status_change', entity: 'Opportunity', description: 'Triggered when a deal is closed-won' },
  ],
  actions: [
    {
      name: 'create_lead',
      description: 'Create a new lead in Salesforce',
      inputSchema: [
        { name: 'firstName', type: 'string', required: false, description: 'Lead first name' },
        { name: 'lastName', type: 'string', required: true, description: 'Lead last name' },
        { name: 'email', type: 'email', required: true, description: 'Lead email' },
        { name: 'company', type: 'string', required: true, description: 'Company name' },
        { name: 'phone', type: 'phone', required: false, description: 'Phone number' },
      ],
      outputDescription: 'Returns Salesforce Lead ID',
    },
    {
      name: 'update_contact',
      description: 'Update an existing Salesforce contact',
      inputSchema: [
        { name: 'contactId', type: 'string', required: true, description: 'Salesforce Contact ID' },
        { name: 'fields', type: 'json', required: true, description: 'Fields to update' },
      ],
      outputDescription: 'Returns update confirmation',
    },
    {
      name: 'sync_entity',
      description: 'Sync a local entity to Salesforce as a custom object',
      inputSchema: [
        { name: 'entity_name', type: 'string', required: true, description: 'Local entity name' },
        { name: 'data', type: 'json', required: true, description: 'Entity data to sync' },
        { name: 'sf_object', type: 'string', required: true, description: 'Target Salesforce object name' },
      ],
      outputDescription: 'Returns sync status and Salesforce record ID',
    },
  ],
  payloadShape: {
    sobject: 'string (Salesforce object type)',
    fields: '{ [key: string]: unknown }',
    operation: 'string (create|update|upsert)',
  },
  status: 'implemented',
};
