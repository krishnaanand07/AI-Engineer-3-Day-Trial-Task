import { v4 as uuidv4 } from 'uuid';
import { Job, SSEEvent } from '../types/pipeline';
import { EventEmitter } from 'events';

// ============================================================
// In-Memory Job Store
// ============================================================

class JobStore {
  private jobs: Map<string, Job> = new Map();
  private eventEmitters: Map<string, EventEmitter> = new Map();

  /**
   * Create a new job and return its ID.
   */
  createJob(prompt: string): string {
    const jobId = uuidv4();
    const now = new Date().toISOString();

    const job: Job = {
      jobId,
      status: 'pending',
      prompt,
      stages: [],
      repairLog: [],
      result: {},
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(jobId, job);
    this.eventEmitters.set(jobId, new EventEmitter());

    console.log(`[JobStore] Created job: ${jobId}`);
    return jobId;
  }

  /**
   * Get a job by ID.
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Update a job.
   */
  updateJob(jobId: string, updates: Partial<Job>): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    Object.assign(job, updates, { updatedAt: new Date().toISOString() });
    this.jobs.set(jobId, job);
  }

  /**
   * Emit an SSE event for a job.
   */
  emitEvent(jobId: string, event: SSEEvent): void {
    const emitter = this.eventEmitters.get(jobId);
    if (emitter) {
      emitter.emit('sse', event);
    }
  }

  /**
   * Subscribe to SSE events for a job.
   */
  subscribe(jobId: string, callback: (event: SSEEvent) => void): () => void {
    const emitter = this.eventEmitters.get(jobId);
    if (!emitter) {
      throw new Error(`Job not found: ${jobId}`);
    }

    emitter.on('sse', callback);

    // Return unsubscribe function
    return () => {
      emitter.off('sse', callback);
    };
  }

  /**
   * Clean up emitter for a job (after completion).
   */
  cleanupEmitter(jobId: string): void {
    const emitter = this.eventEmitters.get(jobId);
    if (emitter) {
      emitter.removeAllListeners();
    }
  }
}

// Singleton instance
export const jobStore = new JobStore();
