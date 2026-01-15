
import React from 'react';
import { LegalFramework, type PolicyInput } from '../PolicyConverter/Data/types';
import'./style.css';

interface PolicyInputPanelProps {
  inputs: PolicyInput[];
  setInputs: React.Dispatch<React.SetStateAction<PolicyInput[]>>;
  isGenerating: boolean;
  onGenerate: () => void;
}

const PolicyInputPanel: React.FC<PolicyInputPanelProps> = ({
  inputs,
  setInputs,
  isGenerating,
  onGenerate
}) => {
  const addRow = () => {
    const newRow: PolicyInput = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      framework: LegalFramework.EgyptianCivilCode,
      text: ''
    };
    setInputs([...inputs, newRow]);
  };

  const removeRow = (id: string) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter(i => i.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof PolicyInput, value: string) => {
    setInputs(inputs.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const applyTemplate = (name: string, text: string) => {
    const newRow: PolicyInput = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      framework: LegalFramework.EgyptianCivilCode,
      text
    };
    setInputs([...inputs, newRow]);
  };

  const templates = [
    { name: 'Refund Clause', text: 'No return after 14 days of purchase.' },
    { name: 'Data Retention', text: 'Customer records must be deleted after 24 months of inactivity.' },
    { name: 'NDA Term', text: 'Confidentiality remains in effect for 5 years post-termination.' }
  ];

  return (
    <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">gavel</span>
            Policy Definition
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Define one or more policy clauses to convert.</p>
        </div>
        <button 
          onClick={addRow}
          className="text-xs font-bold text-teal-accent flex items-center gap-1 hover:text-primary transition-all bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Policy
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
        <div className="space-y-4">
          {inputs.map((row) => (
            <div key={row.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 relative group animate-in fade-in slide-in-from-left-2 shadow-sm">
              <button 
                onClick={() => removeRow(row.id)}
                disabled={inputs.length <= 1}
                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title={inputs.length <= 1 ? "Cannot delete - at least one policy is required" : "Delete Policy"}
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Policy Name</label>
                  <input 
                    className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded text-xs py-1.5 focus:ring-teal-accent px-2"
                    value={row.name}
                    onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                    placeholder="e.g. Return Policy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Legal Framework</label>
                  <select 
                    className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded text-xs py-1.5 focus:ring-teal-accent px-2"
                    value={row.framework}
                    onChange={(e) => updateRow(row.id, 'framework', e.target.value)}
                  >
                    {Object.values(LegalFramework).map(fw => <option key={fw} value={fw}>{fw}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Policy Text (Editable)</label>
                <input 
                  className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded text-xs py-2 focus:ring-teal-accent px-2"
                  value={row.text}
                  onChange={(e) => updateRow(row.id, 'text', e.target.value)}
                  placeholder="e.g. No return after 14 days of purchase."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Ready Made Section */}
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Templates</h3>
          <div className="flex flex-wrap gap-2">
            {templates.map((t, idx) => (
              <button 
                key={idx}
                onClick={() => applyTemplate(t.name, t.text)}
                className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all border border-slate-200 dark:border-slate-700"
              >
                + {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>


      <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-background-dark">
        <button 
          disabled={isGenerating || !inputs.some(i => i.text.trim())}
          onClick={onGenerate}
          className="btn-lex-primary w-full bg-primary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-lg">auto_fix_high</span>
          )}
          {isGenerating ? 'Processing...' : 'Analyze & Generate Logic'}
        </button>
      </div>
    </div>
  );
};

export default PolicyInputPanel;
