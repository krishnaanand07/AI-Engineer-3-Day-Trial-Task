'use client';

interface TryExampleProps {
  onSelect: (prompt: string) => void;
  isLoading: boolean;
}

export default function TryExample({ onSelect, isLoading }: TryExampleProps) {
  const examples = [
    'Real estate CRM with WhatsApp notifications for new leads',
    'Engineering task manager with Slack alerts and GitHub sync',
    'E-commerce backend with Stripe payments and inventory management',
  ];

  return (
    <div className="bg-transparent pt-2">
      <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Quick Examples</h3>
      <div className="flex flex-col gap-2">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => onSelect(ex)}
            disabled={isLoading}
            className="text-[12px] px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors disabled:opacity-50 font-medium text-left shadow-sm flex items-center gap-3 group"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="truncate">{ex}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
