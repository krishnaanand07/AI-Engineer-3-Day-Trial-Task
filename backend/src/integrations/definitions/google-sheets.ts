import { IntegrationDefinition } from '../../types/integrations';

export const googleSheetsIntegration: IntegrationDefinition = {
  id: 'google-sheets',
  displayName: 'Google Sheets',
  description: 'Google Sheets integration (Not yet implemented)',
  authType: 'oauth2',
  baseUrl: 'https://sheets.googleapis.com/v4/spreadsheets',
  status: 'stubbed',
  triggers: [
    {
      name: 'Data Export Event',
      event: 'data_export',
      description: 'Triggered when data needs to be exported to a sheet',
    },
  ],
  actions: [
    {
      name: 'Append Row',
      description: 'Append a row of data to a sheet',
      inputSchema: [
        { name: 'spreadsheetId', type: 'string', required: true, description: 'ID of the spreadsheet' },
        { name: 'range', type: 'string', required: true, description: 'Range (e.g. Sheet1!A1)' },
        { name: 'values', type: 'array', required: true, description: 'Array of values to append' },
      ],
      outputDescription: 'Append status',
    },
    {
      name: 'Update Cell',
      description: 'Update a specific cell',
      inputSchema: [
        { name: 'spreadsheetId', type: 'string', required: true, description: 'ID of the spreadsheet' },
        { name: 'range', type: 'string', required: true, description: 'Range (e.g. Sheet1!A1)' },
        { name: 'value', type: 'string', required: true, description: 'Value to set' },
      ],
      outputDescription: 'Update status',
    },
    {
      name: 'Create New Sheet Tab',
      description: 'Create a new tab in the spreadsheet',
      inputSchema: [
        { name: 'spreadsheetId', type: 'string', required: true, description: 'ID of the spreadsheet' },
        { name: 'title', type: 'string', required: true, description: 'Title of the new sheet tab' },
      ],
      outputDescription: 'Sheet tab creation result',
    }
  ],
  payloadShape: {
    spreadsheetId: 'string',
  },
};
