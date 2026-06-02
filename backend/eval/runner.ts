import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { evalPrompts, EvalPrompt } from './prompts';
import { getGateway } from '../src/gateway';
import { extractIntent } from '../src/pipeline/stages/intentExtraction';
import { generateSchema } from '../src/pipeline/stages/schemaGeneration';
import { generateAppSpec } from '../src/pipeline/stages/appSpecGeneration';
import { validateIntent } from '../src/validation/intentValidator';
import { validateSchema } from '../src/validation/schemaValidator';
import { validateAppSpec } from '../src/validation/appSpecValidator';
import { AppIntent } from '../src/types/appIntent';
import { DataSchema } from '../src/types/dataSchema';
import { AppSpec } from '../src/types/appSpec';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// Evaluation Suite Runner
// ============================================================

interface EvalResult {
  promptId: number;
  promptName: string;
  prompt: string;
  difficulty: string;
  success: boolean;
  failedStage: string | null;
  retryCount: number;
  latencyMs: number;
  integrationsDetected: string[];
  expectedIntegrations: string[];
  integrationMatch: boolean;
  stages: {
    intentExtraction: { success: boolean; latencyMs: number; errors: string[] };
    schemaGeneration: { success: boolean; latencyMs: number; errors: string[] };
    appSpecGeneration: { success: boolean; latencyMs: number; errors: string[] };
  };
  error?: string;
}

async function runEvaluation(): Promise<void> {
  console.log('═══════════════════════════════════════════════════');
  console.log('  OneAtlas AI Pipeline — Evaluation Suite');
  console.log('═══════════════════════════════════════════════════\n');

  const gateway = getGateway();
  const results: EvalResult[] = [];

  for (const evalPrompt of evalPrompts) {
    console.log(`\n─── Prompt ${evalPrompt.id}: ${evalPrompt.name} ───`);
    console.log(`  "${evalPrompt.prompt.substring(0, 80)}${evalPrompt.prompt.length > 80 ? '...' : ''}"`);

    const startTime = Date.now();
    const result: EvalResult = {
      promptId: evalPrompt.id,
      promptName: evalPrompt.name,
      prompt: evalPrompt.prompt,
      difficulty: evalPrompt.difficulty,
      success: false,
      failedStage: null,
      retryCount: 0,
      latencyMs: 0,
      integrationsDetected: [],
      expectedIntegrations: evalPrompt.expectedIntegrations,
      integrationMatch: false,
      stages: {
        intentExtraction: { success: false, latencyMs: 0, errors: [] },
        schemaGeneration: { success: false, latencyMs: 0, errors: [] },
        appSpecGeneration: { success: false, latencyMs: 0, errors: [] },
      },
    };

    try {
      // Stage 1: Intent Extraction
      console.log('  → Stage 1: Intent Extraction...');
      const intentResult = await extractIntent(evalPrompt.prompt, gateway);
      result.stages.intentExtraction.latencyMs = intentResult.latencyMs;

      if (intentResult.status !== 'complete' || !intentResult.output) {
        result.failedStage = 'intentExtraction';
        result.stages.intentExtraction.errors.push(intentResult.error || 'Failed');
        throw new Error(`Intent extraction failed: ${intentResult.error}`);
      }

      const intentErrors = validateIntent(intentResult.output as AppIntent);
      if (intentErrors.length > 0) {
        result.stages.intentExtraction.errors = intentErrors;
        // Continue anyway — we want to see how far we get
      }

      result.stages.intentExtraction.success = true;
      const appIntent = intentResult.output as AppIntent;
      result.integrationsDetected = appIntent.integrations_requested || [];
      console.log(`    ✓ ${intentResult.latencyMs}ms — ${appIntent.appName} (${appIntent.appType})`);

      // Stage 2: Schema Generation
      console.log('  → Stage 2: Schema Generation...');
      const schemaResult = await generateSchema(appIntent, gateway);
      result.stages.schemaGeneration.latencyMs = schemaResult.latencyMs;

      if (schemaResult.status !== 'complete' || !schemaResult.output) {
        result.failedStage = 'schemaGeneration';
        result.stages.schemaGeneration.errors.push(schemaResult.error || 'Failed');
        throw new Error(`Schema generation failed: ${schemaResult.error}`);
      }

      const schemaErrors = validateSchema(schemaResult.output as DataSchema);
      result.stages.schemaGeneration.errors = schemaErrors;
      result.stages.schemaGeneration.success = true;
      const dataSchema = schemaResult.output as DataSchema;
      console.log(`    ✓ ${schemaResult.latencyMs}ms — ${dataSchema.entities.length} entities`);

      // Stage 3: AppSpec Generation
      console.log('  → Stage 3: AppSpec Generation...');
      const appSpecResult = await generateAppSpec(appIntent, dataSchema, gateway);
      result.stages.appSpecGeneration.latencyMs = appSpecResult.latencyMs;

      if (appSpecResult.status !== 'complete' || !appSpecResult.output) {
        result.failedStage = 'appSpecGeneration';
        result.stages.appSpecGeneration.errors.push(appSpecResult.error || 'Failed');
        throw new Error(`AppSpec generation failed: ${appSpecResult.error}`);
      }

      const appSpec = appSpecResult.output as AppSpec;
      const specErrors = validateAppSpec(appSpec, dataSchema);
      result.stages.appSpecGeneration.errors = specErrors;
      result.stages.appSpecGeneration.success = true;
      console.log(`    ✓ ${appSpecResult.latencyMs}ms — ${appSpec.pages.length} pages, ${appSpec.apiEndpoints.length} endpoints`);

      result.success = true;

    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.log(`    ✗ Failed: ${result.error}`);
    }

    result.latencyMs = Date.now() - startTime;
    result.integrationMatch = arraysMatch(
      result.integrationsDetected,
      evalPrompt.expectedIntegrations
    );

    results.push(result);
    console.log(`  Total: ${result.latencyMs}ms | Success: ${result.success}`);

    // Small delay between prompts to avoid rate limiting
    await sleep(2000);
  }

  // Write results
  const outputPath = path.join(__dirname, '..', '..', 'evaluation-log.json');
  const summary = {
    runAt: new Date().toISOString(),
    totalPrompts: results.length,
    successCount: results.filter((r) => r.success).length,
    failedCount: results.filter((r) => !r.success).length,
    avgLatencyMs: Math.round(results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length),
    integrationMatchRate: results.filter((r) => r.integrationMatch).length / results.length,
    results,
  };

  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  Results: ${summary.successCount}/${summary.totalPrompts} passed`);
  console.log(`  Avg latency: ${summary.avgLatencyMs}ms`);
  console.log(`  Integration match rate: ${(summary.integrationMatchRate * 100).toFixed(0)}%`);
  console.log(`  Written to: ${outputPath}`);
  console.log(`═══════════════════════════════════════════════════\n`);
}

function arraysMatch(a: string[], b: string[]): boolean {
  if (b.length === 0) return true; // No expectations
  return b.every((item) => a.includes(item));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runEvaluation().catch(console.error);
