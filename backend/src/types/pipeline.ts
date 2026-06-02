import { z } from 'zod';
import { AppIntent } from './appIntent';
import { DataSchema } from './dataSchema';
import { AppSpec } from './appSpec';

// ============================================================
// Pipeline Types — Job tracking, stage results, repair logs
// ============================================================

export type StageStatus = 'pending' | 'running' | 'complete' | 'failed' | 'repaired';

export type StageName = 'intentExtraction' | 'schemaGeneration' | 'appSpecGeneration';

export interface StageResult {
  stage: StageName;
  status: StageStatus;
  output: AppIntent | DataSchema | AppSpec | null;
  latencyMs: number;
  provider: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface RepairAttempt {
  stage: StageName;
  strategy: 'structural' | 'field' | 'consistency';
  errorInput: string;
  outcome: 'repaired' | 'escalated' | 'failed';
  repairDetails: string;
  timestamp: string;
}

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  jobId: string;
  status: JobStatus;
  prompt: string;
  stages: StageResult[];
  repairLog: RepairAttempt[];
  result: {
    appIntent?: AppIntent;
    dataSchema?: DataSchema;
    appSpec?: AppSpec;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ============================================================
// SSE Event Types
// ============================================================

export type SSEEventType =
  | 'stage_start'
  | 'stage_complete'
  | 'stage_failed'
  | 'repair_attempt'
  | 'generation_complete'
  | 'generation_failed';

export interface SSEEvent {
  type: SSEEventType;
  stage?: StageName;
  data: Record<string, unknown>;
  timestamp: string;
}
