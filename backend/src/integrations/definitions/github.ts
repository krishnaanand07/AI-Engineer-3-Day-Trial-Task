import { IntegrationDefinition } from '../../types/integrations';

export const githubIntegration: IntegrationDefinition = {
  id: 'github',
  displayName: 'GitHub',
  description: 'Create issues, manage repositories, and track PRs via GitHub API.',
  authType: 'api_key',
  baseUrl: 'https://api.github.com',
  triggers: [
    { name: 'on_issue_created', event: 'create', description: 'Triggered when a new GitHub issue is created' },
    { name: 'on_pr_merged', event: 'status_change', description: 'Triggered when a PR is merged' },
  ],
  actions: [
    {
      name: 'create_issue',
      description: 'Create a new GitHub issue',
      inputSchema: [
        { name: 'repo', type: 'string', required: true, description: 'Repository (owner/repo)' },
        { name: 'title', type: 'string', required: true, description: 'Issue title' },
        { name: 'body', type: 'string', required: false, description: 'Issue body' },
      ],
      outputDescription: 'Returns issue number and URL',
    },
  ],
  payloadShape: {
    owner: 'string',
    repo: 'string',
    title: 'string',
    body: 'string',
  },
  status: 'implemented',
};
