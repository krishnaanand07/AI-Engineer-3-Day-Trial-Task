'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import PromptInput from '@/components/PromptInput';
import StageProgress from '@/components/StageProgress';
import AppSpecOutput from '@/components/AppSpecOutput';
import ErrorPanel from '@/components/ErrorPanel';
import IntegrationPanel from '@/components/IntegrationPanel';
import { useSSE } from '@/hooks/useSSE';
import { startGeneration, getJobStatus, BACKEND_URL } from '@/lib/api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobResult, setJobResult] = useState<Record<string, unknown> | null>(null);
  const [repairLog, setRepairLog] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Ref for the prompt input to programmatically update it
  const promptRef = useRef<{ setPrompt: (p: string) => void }>(null);

  const { events, isConnected, connect } = useSSE(BACKEND_URL);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setJobResult(null);
    setRepairLog([]);
    setElapsedTime(0);

    try {
      const { jobId: newJobId } = await startGeneration(prompt);
      setJobId(newJobId);

      // Connect to SSE stream
      connect(newJobId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start generation');
      setIsLoading(false);
    }
  }, [connect]);

  // Fetch final job status when SSE says it's complete
  useEffect(() => {
    if (!jobId || !isLoading) return;

    const finalEvent = events.find(
      (e) => e.type === 'generation_complete' || e.type === 'generation_failed'
    );

    if (finalEvent) {
      getJobStatus(jobId)
        .then((status) => {
          setJobResult(status.result as Record<string, unknown>);
          setRepairLog((status.repairLog as Record<string, unknown>[]) || []);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch final status:', err);
          setIsLoading(false);
        });
    }
  }, [events, jobId, isLoading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm h-14 flex items-center">
        <div className="max-w-[1600px] w-full mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <h1 className="text-[15px] font-bold text-slate-900 tracking-tight">
              OneAtlas AI
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600 border-r border-slate-200 pr-4">
                <svg className="w-4 h-4 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {formatTime(elapsedTime)}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              <span className="text-[13px] font-medium text-slate-600">{isConnected ? 'Pipeline Connected' : 'Ready'}</span>
            </div>
            
            {jobId && (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <span className="text-[12px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  {jobId.slice(0, 8)}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6 pb-20">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-8">
          {/* Top Section: 40:60 Split */}
          <div className="grid grid-cols-10 gap-8">
            {/* Left Column: Prompt, Progress, Health (40%) */}
            <div className="col-span-10 lg:col-span-4 flex flex-col gap-6">
              <PromptInput ref={promptRef} onSubmit={handleSubmit} isLoading={isLoading} />
              <StageProgress events={events} isConnected={isConnected} />
              <ErrorPanel events={events} repairLog={repairLog} />
            </div>

            {/* Right Column: AppSpec Output (60%) */}
            <div className="col-span-10 lg:col-span-6 flex flex-col">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-full min-h-[600px]">
                <AppSpecOutput jobResult={jobResult} />
              </div>
            </div>
          </div>

          {/* Bottom Section: Integrations (Full Width) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-4">
            <IntegrationPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
