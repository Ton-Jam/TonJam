import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Command, Zap, Music, User, Gem, Satellite, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useDebounce from '@/hooks/use-debounce';

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
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onSearch(debouncedQuery);
    setIsTyping(false);
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full mx-auto relative group">
      {/* Main Container */}
      <div className={`relative bg-muted/50 backdrop-blur-xl border rounded-full transition-all duration-300 overflow-hidden ${isFocused ? 'border-blue-500/50 bg-foreground/[0.08] shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-blue-500/30 group-hover:border-blue-500/50'}`}>
        
        {/* Input Area */}
        <div className="relative flex items-center px-1.5 py-2 z-10">
          <div className="pr-1.5">
            <Search className={`h-3.5 w-3.5 transition-colors duration-300 ${isFocused ? 'text-blue-500' : 'text-foreground/30'}`} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsTyping(true);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500 tracking-tight"
          />

          <div className="flex items-center gap-1">
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleClear}
                  className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all"
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
                className={`p-2 rounded-lg transition-all ${isListening ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              </button>
            )}
            
            <div className="hidden md:flex items-center gap-1 px-2 py-2 bg-muted/50 rounded border border-border/50 ml-1">
              <Command className="h-2.5 w-2.5 text-muted-foreground/50" />
              <span className="text-[8px] font-bold text-muted-foreground/50">K</span>
            </div>
          </div>
        </div>

        {/* Bottom Progress Bar (Animated) */}
        <div className="h-[1px] w-full bg-muted/50 relative overflow-hidden">
          {isTyping && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-1/2"
            />
          )}
        </div>
      </div>

      {/* Results / Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && ((!query) || (query && actions.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 bg-background/80 backdrop-blur-3xl border border-border rounded-2xl z-50 shadow-2xl overflow-hidden"
          >
            {!query ? (
              <div className="p-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: 'Trending', icon: Zap, color: 'text-amber-500' },
                  { label: 'Artists', icon: User, color: 'text-blue-500' },
                  { label: 'NFTs', icon: Gem, color: 'text-emerald-500' },
                  { label: 'Live', icon: Satellite, color: 'text-rose-500' }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setQuery(item.label)}
                    className="flex items-center gap-2 p-[2px] rounded-xl bg-muted/50 border border-border/50 hover:bg-muted hover:border-border/80 transition-all group/btn"
                  >
                    <item.icon className={`h-4 w-4 ${item.color} group-hover/btn:scale-110 transition-transform`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 group-hover/btn:text-foreground">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto no-scrollbar">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (action.onClick) action.onClick();
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
