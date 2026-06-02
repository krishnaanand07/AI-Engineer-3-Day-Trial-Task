import { IntegrationDefinition } from '../../types/integrations';

export const jiraIntegration: IntegrationDefinition = {
  id: 'jira',
  displayName: 'Jira',
  description: 'Jira Software integration (Not yet implemented)',
  authType: 'oauth2',
  baseUrl: 'https://api.atlassian.com/ex/jira',
  status: 'implemented',
  triggers: [
    {
      name: 'Task/Issue Event',
      event: 'issue_event',
      description: 'Triggered when an issue event occurs (e.g., status change)',
    },
  ],
  actions: [
    {
      name: 'Create Issue',
      description: 'Create a new Jira issue',
      inputSchema: [
        { name: 'projectKey', type: 'string', required: true, description: 'Jira project key' },
        { name: 'summary', type: 'string', required: true, description: 'Issue summary' },
        { name: 'issueType', type: 'string', required: true, description: 'Issue type (e.g., Task, Bug)' },
        { name: 'description', type: 'string', required: false, description: 'Issue description' },
      ],
      outputDescription: 'Created Jira issue',
    },
    {
      name: 'Update Status',
      description: 'Transition an issue to a new status',
      inputSchema: [
        { name: 'issueId', type: 'string', required: true, description: 'ID or key of the issue' },
        { name: 'transitionId', type: 'string', required: true, description: 'ID of the transition' },
      ],
      outputDescription: 'Transition status',
    },
    {
      name: 'Add Comment',
      description: 'Add a comment to an issue',
      inputSchema: [
        { name: 'issueId', type: 'string', required: true, description: 'ID or key of the issue' },
        { name: 'body', type: 'string', required: true, description: 'Comment text' },
      ],
      outputDescription: 'Created comment',
    },
    {
      name: 'Assign User',
      description: 'Assign an issue to a user',
      inputSchema: [
        { name: 'issueId', type: 'string', required: true, description: 'ID or key of the issue' },
        { name: 'accountId', type: 'string', required: true, description: 'Account ID of the user' },
      ],
      outputDescription: 'Assignment status',
    }
  ],
  payloadShape: {
    webhookEvent: 'string',
    issue: {},
  },
};
