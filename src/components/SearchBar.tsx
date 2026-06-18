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
      <form onSubmit={handleSearch} className="relative w-full">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          className={`w-full bg-zinc-900/60 text-white pl-4 pr-10 py-1.5 rounded-md text-xs placeholder:text-zinc-500 focus:outline-none whitespace-nowrap overflow-hidden text-ellipsis ${inputClassName}`}
          autoFocus={autoFocus}
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
      </form>
      {isSearchOpen && children && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950/95 border border-zinc-800/80 rounded-lg shadow-2xl z-55 backdrop-blur-xl overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}
