import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClockIcon, ArrowRightIcon, XMarkIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { ButtonGroupInput } from './ButtonGroupInput';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  handleSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSuggestionClick: (query: string) => void;
  recentSearches: string[];
  removeRecentSearch: (query: string) => void;
  trendingTopics: string[];
  placeholder: string;
  inputClassName?: string;
  className?: string;
  dropdownClassName?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps & { children?: React.ReactNode }> = ({
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen,
  handleSearch,
  handleSuggestionClick,
  recentSearches,
  removeRecentSearch,
  trendingTopics,
  placeholder,
  inputClassName,
  className,
  dropdownClassName = "absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl overflow-hidden z-50 p-2",
  children,
  autoFocus
}) => {
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSearchOpen]);

  return (
    <div className={className} ref={searchRef}>
      <ButtonGroupInput 
        placeholder={placeholder} 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsSearchOpen(true)}
        onKeyDown={handleSearch}
        className="w-full"
        inputClassName={inputClassName}
        autoFocus={autoFocus}
        variant="search"
      />

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={dropdownClassName}
          >
            {children || (
              <div className="grid grid-cols-1 gap-1">
                {/* Search Header for Results */}
                {searchQuery && (
                  <div className="px-3 pt-2 pb-1 border-b border-border/40">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Search Results</span>
                  </div>
                )}
                
                {/* Search Results Area */}
                {searchQuery && (
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                    {children}
                  </div>
                )}

                {/* Recent & Trending (Only if not searching) */}
                {!searchQuery && (
                  <div className="grid grid-cols-1 gap-4 p-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <ClockIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.length > 0 ? (
                          recentSearches.map((item, index) => (
                            <button
                              key={`${item}-${index}`}
                              onClick={() => handleSuggestionClick(item)}
                              className="px-2 py-1 rounded bg-muted/50 hover:bg-muted text-[10px] font-black uppercase tracking-tight text-foreground transition-colors"
                            >
                              {item}
                            </button>
                          ))
                        ) : (
                          <p className="text-[9px] text-muted-foreground">No recent searches</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <ArrowTrendingUpIcon className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Trending Now</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trendingTopics.map((topic, index) => (
                          <button
                            key={`${topic}-${index}`}
                            onClick={() => handleSuggestionClick(topic)}
                            className="px-2 py-1 rounded bg-primary/5 hover:bg-primary/10 text-[10px] font-black uppercase tracking-tight text-primary transition-colors"
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
