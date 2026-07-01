import React from 'react';
import { History, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecentSearchSectionProps {
  searches: string[];
  onSelect: (term: string) => void;
  onRemove: (term: string) => void;
  onClearAll: () => void;
}

export const RecentSearchSection: React.FC<RecentSearchSectionProps> = ({
  searches,
  onSelect,
  onRemove,
  onClearAll
}) => {
  if (searches.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>Recently Searched</span>
        </h3>
        <button
          onClick={onClearAll}
          className="text-[9px] font-mono font-bold text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-all active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {searches.map((term) => (
            <motion.div
              key={`recent-search-${term}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 bg-[#132354]/40 hover:bg-[#132354]/80 text-white rounded-full pl-3 pr-2 py-1 cursor-pointer group"
            >
              <span
                onClick={() => onSelect(term)}
                className="text-[10px] font-bold uppercase tracking-widest"
              >
                {term}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(term);
                }}
                className="p-1 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white group-hover:scale-105"
                title={`Remove ${term}`}
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
