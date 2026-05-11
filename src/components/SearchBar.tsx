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
  children
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
              <div className="grid grid-cols-2 gap-2">
                {/* Default dropdown content */}
                <div>
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <ClockIcon className="h-3 w-3 text-zinc-400 dark:text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recent</span>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.length > 0 ? (
                      recentSearches.map((item, index) => (
                        <div key={`${item}-${index}`} className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <button 
                            onClick={() => handleSuggestionClick(item)}
                            className="flex-1 text-left text-sm text-foreground/80 hover:text-foreground transition-colors"
                          >
                            {item}
                          </button>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleSuggestionClick(item)}
                              className="p-3 rounded-md hover:bg-primary/20 text-primary transition-colors"
                              title="Search"
                            >
                              <ArrowRightIcon className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => removeRecentSearch(item)}
                              className="p-3 rounded-md hover:bg-destructive/10 text-destructive/70 hover:text-destructive transition-colors"
                              title="Remove"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="px-2 text-xs text-muted-foreground">No recent searches</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <ArrowTrendingUpIcon className="h-3 w-3 text-zinc-500 dark:text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trending</span>
                  </div>
                  <div className="space-y-2">
                    {trendingTopics.map((topic, index) => (
                      <div key={`${topic}-${index}`} className="group flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-colors">
                        <button 
                          onClick={() => handleSuggestionClick(topic)}
                          className="flex-1 text-left text-sm text-foreground/80 hover:text-primary transition-colors"
                        >
                          {topic}
                        </button>
                        <button 
                          onClick={() => handleSuggestionClick(topic)}
                          className="opacity-0 group-hover:opacity-100 p-3 rounded-md bg-primary/10 text-primary transition-all"
                        >
                          <ArrowTrendingUpIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
