import React, { useRef, useEffect } from 'react';
import { Search } from "lucide-react"

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleSuggestionClick?: (suggestion: any) => void;
  recentSearches?: string[];
  removeRecentSearch?: (search: string) => void;
  trendingTopics?: string[];
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  children?: React.ReactNode;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen,
  handleSearch,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  autoFocus = false,
  children
}: SearchBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSearchOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <form onSubmit={handleSearch} className="relative w-full flex items-center rounded-full border border-blue-500/30 hover:border-blue-500/50 focus-within:border-blue-500/60 bg-[#222226] px-3.5 py-1.5 transition-all">
        <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          className={`w-full bg-transparent text-white pl-1 pr-8 py-0.5 text-xs placeholder:text-zinc-400 border-0 !border-none focus:outline-none focus:ring-0 whitespace-nowrap overflow-hidden text-ellipsis ${inputClassName}`}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
      </form>
      {isSearchOpen && children && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800/80 rounded-lg shadow-2xl z-55 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}
