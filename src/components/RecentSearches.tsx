import React, { useState, useEffect } from 'react';
import { History, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecentSearchesProps {
  searches?: string[];
  onSelect?: (term: string) => void;
  onRemove?: (term: string) => void;
  onClearAll?: () => void;
  className?: string;
}

const DEFAULT_SEARCHES = ['Lo-fi hip hop', 'Cyberpunk Beats', 'Phonk Vibes', 'Genesis NFT'];

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches: propSearches,
  onSelect,
  onRemove,
  onClearAll,
  className = "",
}) => {
  const [localSearches, setLocalSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('tonjam_search_history') || localStorage.getItem('recentSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    localStorage.setItem('tonjam_search_history', JSON.stringify(DEFAULT_SEARCHES));
    localStorage.setItem('recentSearches', JSON.stringify(DEFAULT_SEARCHES));
    return DEFAULT_SEARCHES;
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('tonjam_search_history') || localStorage.getItem('recentSearches');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setLocalSearches(parsed);
          }
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const activeSearches = propSearches !== undefined ? propSearches : localSearches;

  if (!activeSearches || activeSearches.length === 0) {
    return null;
  }

  const handleSelect = (term: string) => {
    if (onSelect) {
      onSelect(term);
    }
  };

  const handleRemove = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(term);
    } else {
      const updated = localSearches.filter(s => s !== term);
      setLocalSearches(updated);
      localStorage.setItem('tonjam_search_history', JSON.stringify(updated));
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  const handleClear = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      setLocalSearches([]);
      localStorage.removeItem('tonjam_search_history');
      localStorage.removeItem('recentSearches');
    }
  };

  return (
    <div className={`w-full flex items-center justify-between gap-3 select-none py-1 ${className}`}>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/15 rounded-lg shrink-0 mr-1">
          <History className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Recent Searches</span>
        </div>
        <AnimatePresence mode="popLayout">
          {activeSearches.map((term, idx) => (
            <motion.div
              key={`${term}-${idx}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => handleSelect(term)}
              className="flex items-center gap-1.5 bg-[#132354] hover:bg-blue-600 active:bg-blue-700 px-3 py-1 rounded-full cursor-pointer transition-colors shrink-0 group shadow-sm"
            >
              <Search className="w-3 h-3 text-slate-400 group-hover:text-white shrink-0 transition-colors" />
              <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                {term}
              </span>
              <button
                type="button"
                onClick={(e) => handleRemove(e, term)}
                className="text-slate-400 hover:text-red-300 p-0.5 rounded-full hover:bg-black/20 transition-colors ml-0.5"
                title="Remove search"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={handleClear}
        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 transition-colors shrink-0 pl-2 pr-1 py-1 cursor-pointer"
        title="Clear search history"
      >
        Clear
      </button>
    </div>
  );
};
export default RecentSearches;
