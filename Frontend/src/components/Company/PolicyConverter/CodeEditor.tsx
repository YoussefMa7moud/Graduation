
import React from 'react';

interface CodeEditorProps {
  code: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code }) => {
  // Simple regex-based highlighting for OCL
  const highlight = (text: string) => {
    // Escape HTML first
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    return escaped
      .replace(/\b(context|inv|self|or|and|not|implies)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/--.*$/gm, '<span class="text-green-500">$0</span>')
      .replace(/\b(forAll|exists|select|reject|collect|iterate)\b/g, '<span class="text-yellow-400">$1</span>')
      .replace(/'[^']*'/g, '<span class="text-orange-400">$0</span>')
      .replace(/\b\d+\b/g, '<span class="text-orange-400">$0</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="text-blue-400">$1</span>');
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400"></div>
          <div className="size-2.5 rounded-full bg-amber-400"></div>
          <div className="size-2.5 rounded-full bg-green-400"></div>
        </div>
        <span className="text-[10px] font-mono text-slate-500">rule_egypt_logic.ocl</span>
      </div>
      <div 
        className="code-editor p-6 min-h-[260px] text-sm leading-relaxed focus:outline-none whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: highlight(code) }}
      />
    </div>
  );
};

export default CodeEditor;
