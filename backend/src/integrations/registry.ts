import { IntegrationDefinition } from '../types/integrations';
import { slackIntegration } from './definitions/slack';
import { stripeIntegration } from './definitions/stripe';
import { whatsappIntegration } from './definitions/whatsapp';
import { webhookIntegration } from './definitions/webhook';
import { salesforceIntegration } from './definitions/salesforce';
import { gmailIntegration } from './definitions/gmail';
import { githubIntegration } from './definitions/github';
import { hubspotIntegration } from './definitions/hubspot';
import { notionIntegration } from './definitions/notion';
import { airtableIntegration } from './definitions/airtable';
import { twilioSmsIntegration } from './definitions/twilio-sms';
import { googleSheetsIntegration } from './definitions/google-sheets';
import { jiraIntegration } from './definitions/jira';
import { zapierIntegration } from './definitions/zapier';

// ============================================================
// Integration Registry — Central registry of all integrations
// ============================================================

const ALL_INTEGRATIONS: IntegrationDefinition[] = [
  // Fully implemented (5)
  slackIntegration,
  stripeIntegration,
  whatsappIntegration,
  webhookIntegration,
  salesforceIntegration,
  // Stubbed (9)
  gmailIntegration,
  githubIntegration,
  hubspotIntegration,
  notionIntegration,
  airtableIntegration,
  twilioSmsIntegration,
  googleSheetsIntegration,
  jiraIntegration,
  zapierIntegration,
];

/**
 * Get all integrations.
 */
export function getAllIntegrations(): IntegrationDefinition[] {
  return ALL_INTEGRATIONS;
}

/**
 * Get an integration by ID.
 */
export function getIntegrationById(id: string): IntegrationDefinition | undefined {
  return ALL_INTEGRATIONS.find((i) => i.id === id);
}

/**
 * Get only implemented integrations.
 */
export function getImplementedIntegrations(): IntegrationDefinition[] {
  return ALL_INTEGRATIONS.filter((i) => i.status === 'implemented');
}

/**
 * Get only stubbed integrations.
 */
export function getStubbedIntegrations(): IntegrationDefinition[] {
  return ALL_INTEGRATIONS.filter((i) => i.status === 'stubbed');
}

/**
 * Get all valid integration IDs.
 */
export function getIntegrationIds(): string[] {
  return ALL_INTEGRATIONS.map((i) => i.id);
}
