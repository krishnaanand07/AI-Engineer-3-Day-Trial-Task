'use client';

import { useEffect, useState } from 'react';
import { getIntegrations } from '@/lib/api';

interface Integration {
  id: string;
  displayName: string;
  description: string;
  authType: string;
  triggers: { name: string; description: string }[];
  actions: { name: string; description: string }[];
  status: 'implemented' | 'stubbed';
}

export default function IntegrationPanel() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getIntegrations()
      .then((data) => {
        setIntegrations(
          (data as Record<string, unknown>).integrations as Integration[]
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-transparent flex flex-col h-full items-center justify-center py-10">
        <svg className="w-8 h-8 text-slate-200 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  const implemented = integrations.filter((i) => i.status === 'implemented');
  const stubbed = integrations.filter((i) => i.status === 'stubbed');

  return (
    <div className="bg-transparent pt-2 h-full flex flex-col">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-[15px] font-bold text-slate-900">Integration Directory</h2>
        <p className="text-[12px] text-slate-500 font-medium">
          {implemented.length} implemented · {stubbed.length} stubbed
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 content-start custom-scrollbar overflow-y-auto pr-2">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className={`bg-white rounded-xl p-4 border cursor-pointer transition-all hover:shadow-md ${
              integration.status === 'implemented'
                ? 'border-emerald-200 hover:border-emerald-300 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
            onClick={() =>
              setExpandedId(expandedId === integration.id ? null : integration.id)
            }
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-[12px] ${integration.status === 'implemented' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {integration.displayName.substring(0,2).toUpperCase()}
                </div>
                <h4 className="text-[13px] font-bold text-slate-900">
                  {integration.displayName}
                </h4>
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  integration.status === 'implemented'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-slate-50 text-slate-500 border border-slate-100'
                }`}
              >
                {integration.status}
              </span>
            </div>
            
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed line-clamp-2">{integration.description}</p>
            
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                Auth: {integration.authType}
              </span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                {integration.triggers.length} triggers · {integration.actions.length} actions
              </span>
            </div>

            {expandedId === integration.id && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                {integration.triggers.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Triggers:</p>
                    {integration.triggers.map((t, i) => (
                      <p key={i} className="text-[11px] text-slate-600 ml-1 mb-1"><span className="font-bold text-slate-800">• {t.name}:</span> {t.description}</p>
                    ))}
                  </div>
                )}
                {integration.actions.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Actions:</p>
                    {integration.actions.map((a, i) => (
                      <p key={i} className="text-[11px] text-slate-600 ml-1 mb-1"><span className="font-bold text-slate-800">• {a.name}:</span> {a.description}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
