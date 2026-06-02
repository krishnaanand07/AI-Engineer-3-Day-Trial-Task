'use client';

import { SSEEvent } from '@/hooks/useSSE';

interface ErrorPanelProps {
  events: SSEEvent[];
  repairLog: Record<string, unknown>[];
}

export default function ErrorPanel({ events, repairLog }: ErrorPanelProps) {
  const errors = events.filter(
    (e) => e.type === 'stage_failed' || e.type === 'generation_failed'
  );
  const repairs = events.filter((e) => e.type === 'repair_attempt');
  
  const hasErrors = errors.length > 0;
  const hasRepairs = repairs.length > 0 || repairLog.length > 0;
  const isHealthy = !hasErrors && !hasRepairs;

  // Calculate success percentage loosely based on events
  const totalStages = events.filter(e => e.type === 'stage_start').length || 1;
  const failedStages = errors.length;
  const successPercentage = Math.max(0, Math.round(((totalStages - failedStages) / totalStages) * 100));

  let statusText = 'Operational';
  let statusColor = 'text-emerald-600';
  let iconColor = 'bg-emerald-100 text-emerald-600';

  if (hasErrors) {
    statusText = 'Failing';
    statusColor = 'text-red-600';
    iconColor = 'bg-red-100 text-red-600';
  } else if (hasRepairs) {
    statusText = 'Recovered';
    statusColor = 'text-amber-600';
    iconColor = 'bg-amber-100 text-amber-600';
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded flex items-center justify-center ${iconColor}`}>
          {!hasErrors ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          )}
        </div>
        <h2 className="text-[14px] font-bold text-slate-900">
          System Health
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
          <p className={`text-[13px] font-semibold ${statusColor}`}>
            {statusText}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Repairs</p>
          <p className="text-[13px] font-semibold text-slate-900">
            {repairs.length + repairLog.length}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Errors</p>
          <p className={`text-[13px] font-semibold ${errors.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {errors.length}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Success</p>
          <p className="text-[13px] font-semibold text-emerald-600">
            {successPercentage}%
          </p>
        </div>
      </div>

      {!isHealthy && (
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {/* Live SSE errors */}
          {errors.length > 0 && (
            <div className="space-y-2">
              {errors.map((error, i) => (
                <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-red-700 font-bold truncate">
                      {error.stage || 'Pipeline'} — {error.type}
                    </span>
                  </div>
                  {Boolean(error.data.error) && (
                    <p className="text-[11px] text-red-800 bg-white p-2 rounded border border-red-200 break-words font-mono mt-2">
                      {String(error.data.error)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Historical Repair Log */}
          {repairLog.length > 0 && (
            <div className="space-y-2">
              {repairLog.map((entry, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-slate-800 font-bold truncate">
                      {entry.stage as string}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      entry.outcome === 'repaired' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {entry.outcome as string}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-2 font-mono text-[10px] bg-white border border-slate-200 p-2 rounded truncate">{entry.repairDetails as string}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
