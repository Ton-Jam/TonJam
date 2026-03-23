import React, { useState } from 'react';
import { Search, Loader2, Disc } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { semanticSearchTracks } from '@/services/geminiService';
import { Track } from '@/types';

const SonicSearchSection: React.FC = () => {
  const { allTracks, playTrack } = useAudio();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const matchedTracks = await semanticSearchTracks(query, allTracks);
      setResults(matchedTracks.slice(0, 5));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mt-2 p-2 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
          <h2 className="text-[20px] font-bold text-foreground uppercase tracking-tighter">Sonic AI Search</h2>
        </div>
        
        <div className="flex gap-2 mb-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for vibes, genres, or moods..."
            className="flex-1 bg-muted/50 border border-border rounded-[10px] p-2 text-sm text-foreground outline-none focus:border-neutral-500/50 transition-all placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="px-2 py-2 bg-blue-600 hover:bg-blue-500 text-foreground rounded-[10px] font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {results.map(track => (
              <div key={track.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-[10px] hover:bg-muted transition-all cursor-pointer" onClick={() => playTrack(track)}>
                <img src={track.coverUrl} className="w-12 h-12 rounded-[8px] object-cover" alt="" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">{track.title}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{track.artist}</p>
                </div>
                <Disc className="h-4 w-4 text-blue-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SonicSearchSection;
