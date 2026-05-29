import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Zap, User, Gem, Satellite, Mic, MicOff, SearchIcon, Clock, Trash2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useDebounce from '@/hooks/use-debounce';
import { ButtonGroup } from './ui/button-group';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  short?: string;
  end?: string;
  onClick?: () => void;
}

interface DiscoverSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  actions?: Action[];
  onVoiceSearch?: () => void;
  isListening?: boolean;
}

const STORAGE_KEY = 'tonjam_search_history';

const DiscoverSearchBar: React.FC<DiscoverSearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search the decentralized soundscape...",
  actions = [],
  onVoiceSearch,
  isListening = false
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }
  }, []);

  useEffect(() => {
    onSearch(debouncedQuery);
    setIsTyping(false);
  }, [debouncedQuery, onSearch]);

  const addToHistory = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    setSearchHistory(prev => {
      const newHistory = [cleanTerm, ...prev.filter(item => item !== cleanTerm)].slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const removeFromHistory = (term: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item !== term);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      addToHistory(query);
    }
  };

  return (
    <div className="w-full mx-auto relative group discover-search-bar">
      {/* Main Container */}
      <ButtonGroup className={`relative bg-muted/50 backdrop-blur-xl border-2 rounded-[4px] transition-all duration-300 flex items-center px-2 ease-in-out hover:scale-[1.02] ${isFocused ? 'border-blue-500 bg-foreground/[0.08] shadow-[0_0_15px_rgba(59,130,246,0.2)] scale-[1.02]' : 'border-blue-500/50 group-hover:border-blue-500'}`}>
        <SearchIcon className="h-4 w-4 text-muted-foreground ml-2" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsTyping(true);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none py-2 px-3 text-xs font-medium text-foreground placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500 tracking-tight focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        
        <div className="flex items-center gap-1 pr-2">
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="h-3 w-3" />
              </motion.button>
            )}
          </AnimatePresence>

          {onVoiceSearch && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onVoiceSearch();
              }}
              className={`p-2 rounded-full transition-all ${isListening ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
        </div>
      </ButtonGroup>

      {/* Bottom Progress Bar (Animated) */}
      <div className="h-[3px] w-full bg-muted/50 relative overflow-hidden mt-[-1px] z-10 rounded-b-full">
        {isTyping && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-1/2"
          />
        )}
      </div>

      {/* Results / Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && ((!query) || (query && actions.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-background/80 backdrop-blur-3xl border border-border rounded-2xl z-50 shadow-2xl overflow-hidden"
          >
            {!query ? (
              <div className="space-y-4">
                {/* Trending suggestions */}
                <div className="p-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: 'Trending', icon: Zap, color: 'text-amber-500' },
                    { label: 'Artists', icon: User, color: 'text-blue-500' },
                    { label: 'NFTs', icon: Gem, color: 'text-emerald-500' },
                    { label: 'Live', icon: Satellite, color: 'text-rose-500' }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setQuery(item.label);
                        addToHistory(item.label);
                      }}
                      className="flex items-center gap-2 p-[6px] rounded-xl bg-muted/50 border border-border/50 hover:bg-muted hover:border-border/80 transition-all group/btn"
                    >
                      <item.icon className={`h-4 w-4 ${item.color} group-hover/btn:scale-110 transition-transform`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 group-hover/btn:text-foreground">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 pt-1">
                      <div className="flex items-center gap-2">
                        <History className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Recent Searches</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                        className="text-[9px] font-black uppercase tracking-widest text-rose-500/70 hover:text-rose-500 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto no-scrollbar px-1">
                      {searchHistory.map((term, idx) => (
                        <div 
                          key={`${term}-${idx}`}
                          onClick={() => {
                            setQuery(term);
                            addToHistory(term);
                          }}
                          className="group flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground/40 group-hover:text-blue-400 transition-colors" />
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{term}</span>
                          </div>
                          <button
                            onClick={(e) => removeFromHistory(term, e)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-muted-foreground/30 hover:text-rose-500 transition-all rounded-lg"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto no-scrollbar">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (action.onClick) action.onClick();
                      addToHistory(query);
                      setIsFocused(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-all group/item"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-muted/50 group-hover/item:bg-blue-500/10 transition-colors">
                        {action.icon}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-foreground group-hover/item:text-blue-400 transition-colors">{action.label}</span>
                        {action.description && (
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{action.description}</span>
                        )}
                      </div>
                    </div>
                    {action.end && (
                      <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] group-hover/item:text-muted-foreground">
                        {action.end}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscoverSearchBar;
