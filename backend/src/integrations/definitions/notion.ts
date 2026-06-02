import { IntegrationDefinition } from '../../types/integrations';

export const notionIntegration: IntegrationDefinition = {
  id: 'notion',
  displayName: 'Notion',
  description: 'Notion integration (Not yet implemented)',
  authType: 'oauth2',
  baseUrl: 'https://api.notion.com/v1',
  status: 'implemented',
  triggers: [
    {
      name: 'Data Change',
      event: 'data_change',
      description: 'Triggered when a page or database row changes',
    },
  ],
  actions: [
    {
      name: 'Create Page',
      description: 'Create a new page in Notion',
      inputSchema: [
        { name: 'parentId', type: 'string', required: true, description: 'ID of the parent database or page' },
        { name: 'properties', type: 'object', required: true, description: 'Page properties' },
      ],
      outputDescription: 'Created Notion page',
    },
    {
      name: 'Append Block',
      description: 'Append a block to a Notion page',
      inputSchema: [
        { name: 'blockId', type: 'string', required: true, description: 'ID of the parent block' },
        { name: 'children', type: 'array', required: true, description: 'Blocks to append' },
      ],
      outputDescription: 'Updated Notion block',
    },
    {
      name: 'Update Database Row',
      description: 'Update properties of a database row',
      inputSchema: [
        { name: 'pageId', type: 'string', required: true, description: 'ID of the row (page)' },
        { name: 'properties', type: 'object', required: true, description: 'Properties to update' },
      ],
      outputDescription: 'Updated Notion page',
    }
  ],
  payloadShape: {
    object: 'string',
    data: {},
  },
};
