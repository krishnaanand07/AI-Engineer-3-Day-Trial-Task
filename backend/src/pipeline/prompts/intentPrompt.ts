// ============================================================
// Intent Extraction Prompt — Stage 1
// ============================================================

export function buildIntentExtractionPrompt(userPrompt: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are an expert software architect AI. Your task is to extract a structured "AppIntent" from a natural language app description.

RULES:
1. Output ONLY valid JSON. No markdown, no explanations, no code blocks.
2. If the prompt is vague (fewer than ~10 meaningful words), set "clarification_required" to false but fill in reasonable assumptions in the "assumptions" array.
3. Choose the best "appType" from: crm, ecommerce, project_management, inventory, hr, event_management, saas, custom.
4. Extract all entities the app would need (e.g., User, Product, Order).
5. Identify any integrations mentioned or implied (e.g., slack, stripe, whatsapp).
6. List concrete features the app should have.

OUTPUT SCHEMA:
{
  "appName": "string - a suitable name for the app",
  "appType": "one of: crm, ecommerce, project_management, inventory, hr, event_management, saas, custom",
  "description": "string - a clear 1-2 sentence description of the app",
  "features": ["string array - list of concrete features"],
  "entities": ["string array - data entities the app needs"],
  "integrations_requested": ["string array - integration IDs like 'slack', 'stripe', 'whatsapp', 'webhook', 'salesforce', 'gmail', 'github'"],
  "assumptions": ["string array - assumptions made when prompt was vague"],
  "clarification_required": false
}

EXAMPLE OUTPUT:
{
  "appName": "PropertyHub CRM",
  "appType": "crm",
  "description": "A real estate CRM for managing properties, leads, and agent assignments with WhatsApp notifications.",
  "features": ["Property listing management", "Lead tracking", "Agent assignment", "WhatsApp notification on new lead", "Property search and filters", "Dashboard with sales metrics"],
  "entities": ["User", "Property", "Lead", "Agent", "Showing", "Offer"],
  "integrations_requested": ["whatsapp"],
  "assumptions": [],
  "clarification_required": false
}`;

  return { systemPrompt, userPrompt: `Extract the AppIntent from this app description:\n\n"${userPrompt}"` };
}
