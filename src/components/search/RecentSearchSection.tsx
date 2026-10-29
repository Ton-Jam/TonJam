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
  if (!searches || searches.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-[#00B4D8]" />
          <span>Recent Searches</span>
        </h3>
        <button
          onClick={onClearAll}
          type="button"
          className="text-[9px] font-mono font-bold text-red-400 hover:text-red-300 uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-all active:scale-95"
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
              onClick={() => onSelect(term)}
              className="pill border-0 !border-none flex items-center gap-1.5 bg-[#132354] hover:bg-[#1a2d6d] text-white rounded-full px-3 py-1.5 cursor-pointer group transition-all"
            >
              <span className="text-xs font-semibold text-white">
                {term}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(term);
                }}
                className="p-0.5 hover:bg-white/20 rounded-full transition-all text-slate-300 hover:text-white"
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

