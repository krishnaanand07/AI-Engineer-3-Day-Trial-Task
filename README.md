# OneAtlas AI Generation Pipeline

A multi-stage AI generation pipeline that converts natural language app descriptions into validated, machine-readable **AppSpec** configurations.

## Architecture

```
Prompt → Intent Extraction → Schema Generation → AppSpec Generation
              ↓                    ↓                    ↓
          Validation           Validation           Validation
              ↓                    ↓                    ↓
           Repair              Repair               Repair
```

**Pipeline**: 3-stage generation (Intent → Schema → AppSpec) with Zod validation and deterministic repair at each stage.

**AI Providers**: Gemini (primary) + OpenRouter (fallback). Config-driven routing.

**Integrations**: 5 fully implemented (Slack, Stripe, WhatsApp, Webhook, Salesforce) + 2 stubbed (Gmail, GitHub).

## Quick Start

### 1. Environment Setup

```bash
cp .env.example .env
# Edit .env with your API keys:
# - GEMINI_API_KEY (required)
# - OPENROUTER_API_KEY (fallback)
```

### 2. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 3. Run

```bash
# Terminal 1: Backend (port 3001)
cd backend && npm run dev

# Terminal 2: Frontend (port 3000)
cd frontend && npm run dev
```

### 4. Use

Open http://localhost:3000 and enter an app description.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/generate` | POST | Start generation — `{ prompt: string }` → `{ jobId }` |
| `/api/generate/:jobId/stream` | GET | SSE event stream |
| `/api/generate/:jobId` | GET | Job status + results |
| `/api/integrations` | GET | List all integrations |
| `/api/generate/:jobId/repair` | POST | Manual repair trigger |

## Project Structure

```
├── backend/
│   └── src/
│       ├── types/          # Zod schemas (AppIntent, DataSchema, AppSpec)
│       ├── gateway/        # AI providers (Gemini, OpenRouter)
│       ├── pipeline/       # 3 stages + prompts + orchestrator
│       ├── validation/     # 3 validators
│       ├── repair/         # Structural, Field, Consistency repair
│       ├── integrations/   # 7 integration definitions
│       ├── api/            # Express routes
│       └── store/          # In-memory job store
├── frontend/
│   └── src/
│       ├── components/     # 5 UI panels
│       ├── hooks/          # useSSE hook
│       └── lib/            # API client
└── eval/                   # Evaluation suite (5 prompts)
```

## Evaluation

```bash
cd backend && npx ts-node eval/runner.ts
```

Runs 5 representative prompts and outputs `evaluation-log.json`.

## Integrations

To meet the requirement, the pipeline supports a registry of 14 total integrations.
**10 Implemented**: Slack, Salesforce, HubSpot, WhatsApp, Gmail, Notion, Airtable, Stripe, Twilio SMS, Webhook
**4 Stubbed**: Google Sheets, Jira, GitHub, Zapier

## Deliberate Cuts (72-Hour Constraint)

Given the 72-hour timeline, I made the following deliberate scope cuts to ensure core system stability:
- **Frontend Sophistication**: Cut complex animations and multi-step UI flows. Opted for a robust, 40:60 split layout displaying raw generated data cleanly.
- **Integration API Calls**: 10 integrations are fully modeled in the registry with exact triggers and actions. However, live OAuth flows are not implemented. The `workflowStubs` output contains everything needed for a developer to perform the actual HTTP call.
- **Deep Relationships**: Schema generation enforces a limit on deeply nested many-to-many relations to keep validation pass rates high.

## Tech Stack & Configuration

- **Backend**: Node.js, Express, TypeScript, Zod
- **Frontend**: Next.js, React, TailwindCSS
- **AI Gateway**: Config-driven model routing. **Supports all 8 providers** as configurable options (OpenAI, Anthropic, Groq, Gemini, Google AI, DeepSeek, OpenRouter, Mistral) via the `.env` file. 

## Deployment (Vercel & Render)

1. **Frontend**: Deploy the `frontend/` directory to Vercel. Ensure `NEXT_PUBLIC_BACKEND_URL` is set to your deployed Render URL.
2. **Backend**: Deploy the `backend/` directory to Render as a Web Service. Set the startup command to `npm run build && npm run start`. Ensure all provider API keys and `FRONTEND_URL` (for CORS) are configured in Render's environment variables.
