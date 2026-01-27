
import React, { useState } from 'react';
import type { OCLGenerationResponse, PolicyInput } from './Data/types';
import CodeEditor from './CodeEditor';
import'./style.css';


interface LogicOutputPanelProps {
  result: OCLGenerationResponse | null;
  isGenerating: boolean;
  onDiscard: () => void;
  onSave: (saveData: {
    policyName: string;
    legalFramework: string;
    policyText: string;
    oclCode: string;
    explanation: string;
    articleRef: string;
  }) => Promise<void>;
  currentInput: PolicyInput | null;
}

const LogicOutputPanel: React.FC<LogicOutputPanelProps> = ({ 
  result, 
  isGenerating, 
  onDiscard, 
  onSave,
  currentInput 
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!result || !currentInput) return;
    
    setIsSaving(true);
    try {
      await onSave({
        policyName: currentInput.name,
        legalFramework: currentInput.framework,
        policyText: currentInput.text,
        oclCode: result.oclCode,
        explanation: result.explanation,
        articleRef: result.articleRef
      });
    } catch (error) {
      // Error is already handled in onSave
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="p-6 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-accent text-xl">code</span>
            AI-Suggested OCL Rule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Verification logic mapped to Egyptian legal standards.</p>
        </div>
       
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {result ? (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* AI Insight Box */}
            <div className="mb-6 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800 rounded-xl p-4 flex gap-4">
              <div className="size-10 shrink-0 bg-teal-600 rounded-full flex items-center justify-center text-white">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-teal-800 dark:text-teal-400 uppercase tracking-widest mb-1">AI Logic Extraction</h4>
                <p className="text-xs text-teal-900 dark:text-teal-300 leading-relaxed">
                  I've analyzed the policy text and mapped it to <span className="font-bold">{result.articleRef}</span>. {result.explanation}
                </p>
              </div>
            </div>

            {/* Code Block */}
            <CodeEditor code={result.oclCode} />

            {/* Validation List */}
            <div className="mt-6 space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Logic Validation</h4>
              {result.validation.map((v, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    <span className="text-xs font-medium">{v.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{v.standard}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                <div className="size-12 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
                <p className="text-sm font-medium animate-pulse">Analyzing legal requirements and building logic tree...</p>
              </div>
            ) : (
              <>
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl mb-4">
                  <span className="material-symbols-outlined text-5xl opacity-20">rule_settings</span>
                </div>
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">No logic generated yet</h3>
                <p className="text-xs max-w-[240px]">Paste a policy on the left and click "Generate" to see the AI verification logic.</p>
              </>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0">
          <button 
            onClick={onDiscard}
            disabled={!result}
            className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Discard Suggestion
          </button>
          <button 
            onClick={handleSave}
            disabled={!result || !currentInput || isSaving}
            className=" btn-lex-primary flex-[1.5] py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                Save as Rule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogicOutputPanel;
