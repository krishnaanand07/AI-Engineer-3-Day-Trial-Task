'use client';

import { useState } from 'react';

interface AppSpecOutputProps {
  jobResult: Record<string, unknown> | null;
}

type Tab = 'entities' | 'pages' | 'apis' | 'auth' | 'integrations' | 'workflows';

export default function AppSpecOutput({ jobResult }: AppSpecOutputProps) {
  const [activeTab, setActiveTab] = useState<Tab>('entities');

  if (!jobResult) {
    return (
      <div className="bg-transparent flex flex-col h-full items-center justify-center py-20">
        <svg className="w-12 h-12 text-slate-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="text-[14px] font-bold text-slate-900 mb-1">No Output Yet</h3>
        <p className="text-slate-500 text-[13px] text-center max-w-[250px]">Submit an app description to generate your application specification.</p>
      </div>
    );
  }

  const appSpec = (jobResult as Record<string, unknown>).appSpec as Record<string, unknown> | undefined;
  const dataSchema = (jobResult as Record<string, unknown>).dataSchema as Record<string, unknown> | undefined;
  const appIntent = (jobResult as Record<string, unknown>).appIntent as Record<string, unknown> | undefined;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'entities', label: 'Entities' },
    { key: 'pages', label: 'Pages' },
    { key: 'apis', label: 'APIs' },
    { key: 'auth', label: 'Auth' },
    { key: 'integrations', label: 'Hooks' },
    { key: 'workflows', label: 'Workflows' },
  ];

  return (
    <div className="bg-transparent flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-slate-900">
          Generated Output
        </h2>
        {appIntent && (
          <span className="text-[12px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {(appIntent as Record<string, unknown>).appName as string}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-5 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2.5 text-[13px] font-semibold whitespace-nowrap transition-all border-b-2 relative -bottom-[1px] ${
              activeTab === tab.key
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'entities' && dataSchema && (
          <EntitiesView entities={(dataSchema as Record<string, unknown>).entities as Record<string, unknown>[]} />
        )}
        {activeTab === 'pages' && appSpec && (
          <PagesView pages={(appSpec as Record<string, unknown>).pages as Record<string, unknown>[]} />
        )}
        {activeTab === 'apis' && appSpec && (
          <ApisView endpoints={(appSpec as Record<string, unknown>).apiEndpoints as Record<string, unknown>[]} />
        )}
        {activeTab === 'auth' && appSpec && (
          <AuthView authRules={(appSpec as Record<string, unknown>).authRules as Record<string, unknown>} />
        )}
        {activeTab === 'integrations' && appSpec && (
          <HooksView hooks={(appSpec as Record<string, unknown>).integrationHooks as Record<string, unknown>[]} />
        )}
        {activeTab === 'workflows' && appSpec && (
          <WorkflowsView workflows={(appSpec as Record<string, unknown>).workflowStubs as Record<string, unknown>[]} />
        )}
      </div>
    </div>
  );
}

function EntitiesView({ entities }: { entities: Record<string, unknown>[] }) {
  if (!entities || entities.length === 0) return <p className="text-slate-400 text-sm">No entities</p>;
  return (
    <div className="space-y-4">
      {entities.map((entity, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-[14px] text-slate-900">{entity.name as string}</h4>
            <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 font-mono tracking-tight">{entity.tableName as string}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {((entity.fields as Record<string, unknown>[]) || []).map((field, j) => (
              <div key={j} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md p-1.5 px-2.5 text-[11px] shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-800 font-semibold">{field.name as string}</span>
                  <span className="text-indigo-500 font-mono text-[10px]">{field.type as string}</span>
                </div>
                {(field.isPrimary as boolean) && <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded ml-2">PK</span>}
              </div>
            ))}
          </div>
          {((entity.relations as Record<string, unknown>[]) || []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              {((entity.relations as Record<string, unknown>[]) || []).map((rel, k) => (
                <span key={k} className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 flex items-center gap-1.5">
                  {rel.type as string} <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg> {rel.target as string}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PagesView({ pages }: { pages: Record<string, unknown>[] }) {
  if (!pages || pages.length === 0) return <p className="text-slate-400 text-sm">No pages</p>;
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <table className="w-full text-[13px] text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Route</th>
            <th className="py-3 px-4">Layout</th>
            <th className="py-3 px-4">Entity</th>
            <th className="py-3 px-4">Components</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pages.map((page, i) => (
            <tr key={i} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
              <td className="py-3.5 px-4 font-semibold text-slate-900">{page.name as string}</td>
              <td className="py-3.5 px-4 font-mono text-[12px] text-indigo-600">{page.route as string}</td>
              <td className="py-3.5 px-4 text-[12px]">
                <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium">{page.layout as string}</span>
              </td>
              <td className="py-3.5 px-4 text-[13px] font-medium text-slate-900">{(page.entity as string) || '—'}</td>
              <td className="py-3.5 px-4 text-[12px] text-slate-500">{((page.components as string[]) || []).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApisView({ endpoints }: { endpoints: Record<string, unknown>[] }) {
  if (!endpoints || endpoints.length === 0) return <p className="text-slate-400 text-sm">No endpoints</p>;

  const methodColors: Record<string, string> = {
    GET: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    POST: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    PUT: 'text-amber-700 bg-amber-50 border-amber-200',
    PATCH: 'text-orange-700 bg-orange-50 border-orange-200',
    DELETE: 'text-red-700 bg-red-50 border-red-200',
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <table className="w-full text-[13px] text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <th className="py-3 px-4 w-20">Method</th>
            <th className="py-3 px-4">Path</th>
            <th className="py-3 px-4">Handler</th>
            <th className="py-3 px-4 text-center w-20">Auth</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {endpoints.map((ep, i) => (
            <tr key={i} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
              <td className="py-3.5 px-4">
                <span className={`font-mono font-bold text-[10px] px-2 py-1 rounded border ${methodColors[ep.method as string] || 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  {ep.method as string}
                </span>
              </td>
              <td className="py-3.5 px-4 font-mono text-[12px] text-slate-700 font-medium">{ep.path as string}</td>
              <td className="py-3.5 px-4 text-[12px] text-slate-500 truncate max-w-[200px]">{ep.handler as string}</td>
              <td className="py-3.5 px-4 text-center">
                {(ep.authRequired as boolean) ? (
                  <span className="text-slate-400"><svg className="w-4 h-4 mx-auto text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>
                ) : (
                  <span className="text-slate-300"><svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg></span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuthView({ authRules }: { authRules: Record<string, unknown> }) {
  if (!authRules) return <p className="text-slate-400 text-sm">No auth rules</p>;
  const roles = (authRules.roles as Record<string, unknown>[]) || [];
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 inline-block shadow-sm">
        <p className="text-[12px] text-slate-600 font-medium flex items-center gap-2">
          Default role: <span className="font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">{authRules.defaultRole as string}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.map((role, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors">
            <h4 className="text-[14px] font-bold text-slate-900 capitalize mb-1">{role.name as string}</h4>
            <p className="text-[12px] text-slate-500 mb-4">{role.description as string}</p>
            <div className="flex flex-col gap-2">
              {((role.permissions as Record<string, unknown>[]) || []).map((perm, j) => (
                <div key={j} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded p-2 text-[11px]">
                  <span className="font-bold text-slate-800 font-mono">{perm.entity as string}</span>
                  <div className="flex items-center gap-1">
                    {['read', 'write', 'delete'].map(action => (
                      <span key={action} className={`w-5 h-5 flex items-center justify-center rounded font-bold text-[9px] ${perm[action] ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-400 opacity-30'}`}>
                        {action.charAt(0).toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HooksView({ hooks }: { hooks: Record<string, unknown>[] }) {
  if (!hooks || hooks.length === 0) return <p className="text-slate-400 text-sm">No integration hooks</p>;
  return (
    <div className="space-y-3">
      {hooks.map((hook, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-[13px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 pr-3 bg-slate-50">
               <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                 {(hook.integrationId as string).substring(0,2).toUpperCase()}
               </div>
               <span className="text-slate-900 font-bold">{hook.integrationId as string}</span>
            </div>
            <span className="text-slate-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
            <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{hook.action as string}</span>
          </div>
          <p className="text-[12px] text-slate-500 mt-2 pl-1">{hook.description as string}</p>
        </div>
      ))}
    </div>
  );
}

function WorkflowsView({ workflows }: { workflows: Record<string, unknown>[] }) {
  if (!workflows || workflows.length === 0) return <p className="text-slate-400 text-sm">No workflow stubs</p>;
  return (
    <div className="space-y-3">
      {workflows.map((wf, i) => {
        const trigger = wf.trigger as Record<string, unknown>;
        return (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-[13px]">
            <h4 className="text-slate-900 font-bold text-[14px] mb-4">{wf.name as string}</h4>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trigger</span>
                <span className="text-slate-800 font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] shadow-sm">{trigger?.entity as string}.{trigger?.event as string}</span>
              </div>
              <span className="text-slate-300 mt-4"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Action</span>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] shadow-sm">
                   <span className="font-bold text-indigo-600">{wf.integrationId as string}</span>
                   <span className="text-slate-300">/</span>
                   <span className="font-medium text-slate-700">{wf.action as string}</span>
                </div>
              </div>
            </div>
            <p className="text-[12px] text-slate-500 mt-3">{wf.description as string}</p>
          </div>
        );
      })}
    </div>
  );
}
