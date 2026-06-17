import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, limit, getDocs, where } from "firebase/firestore"

export function SearchBar() {
  const [queryText, setQueryText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (queryText.length >= 2) {
        // Fetch suggestions from Firestore
        try {
          const trackQuery = query(collection(db, 'tracks'), limit(5));
          const snapshot = await getDocs(trackQuery);
          const tracks = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data(), type: 'track' }))
            .filter((t: any) => t.title?.toLowerCase().includes(queryText.toLowerCase()));
          setSuggestions(tracks);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [queryText]);

  const saveToHistory = (newQuery: string) => {
    if (!newQuery.trim()) return;
    setHistory(prev => {
      const updated = [newQuery, ...prev.filter(item => item !== newQuery)].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    saveToHistory(queryText);
    setShowDropdown(false);
  };

  const handleSelect = (term: string) => {
    setQueryText(term);
    saveToHistory(term);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-sm" ref={containerRef}>
      <form onSubmit={handleSearch}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-9 pr-4"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onFocus={() => setShowDropdown(true)}
        />
      </form>
      
      {showDropdown && (history.length > 0 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-md z-50 p-2">
          {history.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground px-2 py-1">Recent Searches</p>
              {history.map((term, index) => (
                <button
                  key={`history-${index}`}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded-sm"
                  onClick={() => handleSelect(term)}
                >
                  {term}
                </button>
              ))}
            </>
          )}
          {suggestions.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground px-2 py-1 mt-2">Suggestions</p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded-sm"
                  onClick={() => handleSelect(suggestion.title)}
                >
                  {suggestion.title} - {suggestion.artist}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
