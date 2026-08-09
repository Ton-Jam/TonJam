import React from 'react';
import { Search, ArrowUpLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchSuggestionListProps {
  suggestions: string[];
  query: string;
  onSelect: (term: string) => void;
  isSearching?: boolean;
}

export const SearchSuggestionList: React.FC<SearchSuggestionListProps> = ({
  suggestions,
  query,
  onSelect,
  isSearching = false
}) => {
  if (suggestions.length === 0 && !isSearching) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-12 left-0 right-0 bg-[#0c133a] rounded-[12px] overflow-hidden shadow-2xl z-50 p-1"
    >
      <div className="space-y-0.5">
        {isSearching && (
          <div className="px-4 py-3 flex items-center gap-3 text-slate-400">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Scanning Frequencies...</span>
          </div>
        )}
        
        {suggestions.map((suggestion, index) => {
          // Highlight match if query exists
          const lowerSuggestion = suggestion.toLowerCase();
          const lowerQuery = query.toLowerCase();
          const matchIndex = lowerSuggestion.indexOf(lowerQuery);

          return (
            <button
              key={`suggestion-${index}-${suggestion}`}
              onClick={() => onSelect(suggestion)}
              className="w-full text-left px-4 py-3 rounded-[12px] hover:bg-white/5 active:scale-[0.99] transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-500 group-hover:text-white" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300 group-hover:text-white">
                  {matchIndex !== -1 ? (
                    <>
                      {suggestion.slice(0, matchIndex)}
                      <span className="text-[#00B4D8] font-extrabold">
                        {suggestion.slice(matchIndex, matchIndex + query.length)}
                      </span>
                      {suggestion.slice(matchIndex + query.length)}
                    </>
                  ) : (
                    suggestion
                  )}
                </span>
              </div>
              <ArrowUpLeft className="w-4 h-4 text-slate-500 group-hover:text-white rotate-90" />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
