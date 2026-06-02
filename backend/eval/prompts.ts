// ============================================================
// Evaluation Prompts — 5 representative test cases
// ============================================================

export interface EvalPrompt {
  id: number;
  name: string;
  prompt: string;
  expectedType: string;
  expectedIntegrations: string[];
  difficulty: 'normal' | 'edge_case' | 'ambiguous';
}

export const evalPrompts: EvalPrompt[] = [
  {
    id: 1,
    name: 'Real Estate CRM',
    prompt: 'Build a real estate CRM that manages properties, leads, and agent assignments. When a new lead comes in, send a WhatsApp notification to the assigned agent. Include a dashboard with sales metrics and property search functionality.',
    expectedType: 'crm',
    expectedIntegrations: ['whatsapp'],
    difficulty: 'normal',
  },
  {
    id: 2,
    name: 'Engineering Task Manager',
    prompt: 'I need an engineering task manager for a team of 20 developers. It should have sprints, story points, bug tracking, and send Slack notifications when tasks are assigned or completed. Include a kanban board view.',
    expectedType: 'project_management',
    expectedIntegrations: ['slack'],
    difficulty: 'normal',
  },
  {
    id: 3,
    name: 'E-commerce Backend',
    prompt: 'Build an e-commerce backend with product catalog, shopping cart, order management, and Stripe payment integration. Send order confirmation emails via Gmail. Include inventory tracking and a merchant dashboard.',
    expectedType: 'ecommerce',
    expectedIntegrations: ['stripe', 'gmail'],
    difficulty: 'normal',
  },
  {
    id: 4,
    name: 'Edge Case — Minimal Prompt',
    prompt: 'An app.',
    expectedType: 'custom',
    expectedIntegrations: [],
    difficulty: 'edge_case',
  },
  {
    id: 5,
    name: 'Ambiguous — Notion for Doctors',
    prompt: 'Build something like Notion for doctors.',
    expectedType: 'saas',
    expectedIntegrations: [],
    difficulty: 'ambiguous',
  },
];
