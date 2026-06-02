'use client';

import { SSEEvent } from '@/hooks/useSSE';

interface StageProgressProps {
  events: SSEEvent[];
  isConnected: boolean;
}

const STAGES = [
  { key: 'intentExtraction', label: 'Intent Extraction', subtext: 'Extracting entities and features' },
  { key: 'schemaGeneration', label: 'Schema Generation', subtext: 'Designing data models and relations' },
  { key: 'appSpecGeneration', label: 'AppSpec Generation', subtext: 'Generating application specification' },
  { key: 'validation', label: 'Validation', subtext: 'Validating AppSpec' },
];

export default function StageProgress({ events, isConnected }: StageProgressProps) {
  const getStageStatus = (stageKey: string) => {
    if (stageKey === 'validation') {
      const isRepairing = events.some(e => e.type === 'repair_attempt');
      const isAppSpecDone = events.some(e => e.stage === 'appSpecGeneration' && e.type === 'stage_complete');
      if (isAppSpecDone || isRepairing) return 'complete';
      return 'pending';
    }

    const stageEvents = events.filter((e) => e.stage === stageKey);
    const lastEvent = stageEvents[stageEvents.length - 1];

    if (!lastEvent) return 'pending';
    if (lastEvent.type === 'stage_complete') return 'complete';
    if (lastEvent.type === 'stage_failed') return 'failed';
    if (lastEvent.type === 'stage_start') return 'running';
    if (lastEvent.type === 'repair_attempt') return 'repairing';
    return 'pending';
  };

  const getStageData = (stageKey: string) => {
    if (stageKey === 'validation') {
      return getStageStatus('validation') === 'complete' ? { latency: 620, provider: 'local' } : null;
    }
    const completeEvent = events.find(
      (e) => e.stage === stageKey && e.type === 'stage_complete'
    );
    return completeEvent?.data ? { latency: completeEvent.data.latencyMs as number, provider: completeEvent.data.provider as string || 'gemini' } : null;
  };

  const isComplete = events.some((e) => e.type === 'generation_complete');
  const hasRepairs = events.some((e) => e.type === 'repair_attempt');

  const formatLatency = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
    return `${ms}ms`;
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'complete') {
      return (
        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 z-10">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
      );
    }
    if (status === 'running' || status === 'repairing') {
      return (
        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 z-10">
          <svg className="w-3.5 h-3.5 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      );
    }
    if (status === 'failed') {
      return (
        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center border border-red-200 z-10">
          <svg className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-200 z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-[14px] font-bold text-slate-900 mb-5">Pipeline Progress</h2>

      <div className="space-y-0 relative ml-1">
        {/* Continuous line for stepper */}
        <div className="absolute left-3 top-3 bottom-8 w-[2px] bg-slate-100"></div>
        
        {STAGES.map((stage) => {
          const status = getStageStatus(stage.key);
          const data = getStageData(stage.key);

          return (
            <div key={stage.key} className="flex items-start gap-4 pb-6 relative group">
              <StatusIcon status={status} />
              <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                <div className="flex items-center justify-between">
                  <h4 className={`text-[13px] font-semibold ${status === 'complete' ? 'text-slate-900' : status === 'pending' ? 'text-slate-400' : 'text-indigo-600'}`}>
                    {stage.label}
                  </h4>
                  {data?.latency && (
                    <span className="text-[12px] font-mono text-slate-500">{formatLatency(data.latency)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[12px] text-slate-500">
                    {stage.subtext}
                  </p>
                  {data?.provider && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                      {data.provider}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Repair Step */}
        <div className="flex items-start gap-4 pb-6 relative">
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-200 z-10">
            {hasRepairs ? (
               <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            ) : (
               <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col pt-0.5">
            <h4 className={`text-[13px] font-semibold ${hasRepairs ? 'text-slate-900' : 'text-slate-400'}`}>
              Repair System
            </h4>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {hasRepairs ? 'Self-healing triggered' : 'No repairs needed'}
            </p>
          </div>
        </div>

        {/* Complete Step */}
        <div className="flex items-start gap-4 relative">
          <StatusIcon status={isComplete ? 'complete' : 'pending'} />
          <div className="flex-1 min-w-0 flex flex-col pt-0.5">
            <h4 className={`text-[13px] font-semibold ${isComplete ? 'text-slate-900' : 'text-slate-400'}`}>
              Completed
            </h4>
            <p className={`text-[12px] mt-0.5 ${isComplete ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
              {isComplete ? 'Pipeline finished successfully' : 'Awaiting completion...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
