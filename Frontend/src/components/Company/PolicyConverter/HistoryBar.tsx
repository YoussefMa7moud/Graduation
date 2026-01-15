
import React from 'react';
import type { HistoryItem } from '../PolicyConverter/Data/types';

interface HistoryBarProps {
  items: HistoryItem[];
  onDelete: (id: string) => void;
  onSelect: (item: HistoryItem) => void;
}

const HistoryBar: React.FC<HistoryBarProps> = ({ items, onDelete, onSelect }) => {
  if (items.length === 0) return null;

  return (
    <div className="h-14 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 flex items-center px-6 gap-3 overflow-x-auto custom-scrollbar shrink-0">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap mr-2">
        Recent History
      </span>
      {items.map((item) => (
        <div 
          key={item.id}
          className="group flex items-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full pl-3 pr-1 py-1 transition-all cursor-pointer border border-transparent hover:border-teal-500/30"
          onClick={() => onSelect(item)}
        >
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
            {item.name}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="ml-2 p-1 text-slate-400 hover:text-red-500 transition-colors rounded-full"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default HistoryBar;
