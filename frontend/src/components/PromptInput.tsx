'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const PromptInput = forwardRef<{ setPrompt: (p: string) => void }, PromptInputProps>(
  ({ onSubmit, isLoading }, ref) => {
    const [prompt, setPrompt] = useState('');

    useImperativeHandle(ref, () => ({
      setPrompt: (p: string) => setPrompt(p),
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        onSubmit(prompt.trim());
      }
    };

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative overflow-hidden">
        <h2 className="text-[14px] font-bold text-slate-900 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          App Description
        </h2>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col relative z-10">
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Build a real estate CRM with WhatsApp notifications for new leads"
            className="w-full h-[100px] bg-slate-50/50 border border-slate-200 rounded-lg p-3 text-[13px] text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] text-slate-400 font-medium">
              {prompt.length} / 500
            </span>
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Generating...
                </>
              ) : 'Generate AppSpec'}
            </button>
          </div>
        </form>
      </div>
    );
  }
);

PromptInput.displayName = 'PromptInput';
export default PromptInput;
