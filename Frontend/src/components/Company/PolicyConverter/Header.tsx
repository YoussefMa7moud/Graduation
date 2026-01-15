
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark shrink-0">
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-2 text-sm">
          <a className="text-slate-500 hover:text-primary transition-colors" href="#">Compliance</a>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">Policy to Rule Converter</span>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
          <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
          AI Processor Online
        </div>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
          <span className="material-symbols-outlined text-xl">help_outline</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
