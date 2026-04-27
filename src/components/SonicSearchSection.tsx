import React, { useState } from 'react';
import { Search, Loader2, Disc, User, Gem, Sparkles, Navigation, Play, ArrowUpRight, X } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { globalAISearch } from '@/services/geminiService';
import { ButtonGroupInput } from './ButtonGroupInput';
import { Track, Artist } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const SonicSearchSection: React.FC = () => {
  const { allTracks, playTrack, artists, allNFTs } = useAudio();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const searchResults = await globalAISearch(query, {
        tracks: allTracks,
        artists: artists,
        nfts: allNFTs
      });
      setResults(searchResults.results);
      setSuggestion(searchResults.suggestion);
    } catch (error) {
      console.error("Global search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (item: any) => {
    if (item.type === 'track') {
      const track = allTracks.find(t => t.id === item.id);
      if (track) playTrack(track);
    } else if (item.type === 'artist') {
      navigate(`/artist/${item.id}`);
    } else if (item.type === 'nft') {
      navigate(`/nft/${item.id}`);
    }
  };

  return (
    <section className="relative overflow-hidden glass border border-blue-500/30 rounded-[20px] p-6 lg:p-10 mb-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/5 rounded-full blur-[60px] -z-10" />
      
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Sonic Core</h2>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Neural Search Interface v2.0</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['Play some techno', 'Find electronic NFTs', 'Search for pop artists'].map((hint) => (
              <button 
                key={hint}
                onClick={() => { setQuery(hint); }}
                className="text-[9px] font-bold text-blue-500/80 hover:text-blue-500 uppercase tracking-widest px-3 py-1 bg-blue-500/5 rounded-full transition-all border border-blue-500/10"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative group">
          <ButtonGroupInput 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe the sound, mood, or artifact you seek..."
            className="flex-1"
            inputClassName="bg-white/5 border border-white/10 p-7 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all rounded-2xl placeholder:text-muted-foreground/30 shadow-inner"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            onSearch={handleSearch}
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            </div>
          )}
        </div>

        <AnimatePresence>
          {hasSearched && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 animate-in fade-in duration-500"
            >
              {suggestion && (
                <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <p className="text-xs font-bold italic text-foreground/80 leading-relaxed tracking-tight">{suggestion}</p>
                </div>
              )}

              {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.map((item, idx) => (
                    <motion.div 
                      key={`${item.type}-${item.id}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                      onClick={() => handleAction(item)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`p-3 rounded-xl ${
                            item.type === 'track' ? 'bg-blue-500/10 text-blue-500' :
                            item.type === 'artist' ? 'bg-pink-500/10 text-pink-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {item.type === 'track' ? <Disc className="h-5 w-5" /> : 
                             item.type === 'artist' ? <User className="h-5 w-5" /> : 
                             <Gem className="h-5 w-5" />}
                          </div>
                   
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black uppercase tracking-tighter text-foreground group-hover:text-blue-400 transition-colors">{item.name}</span>
                            <Badge variant="outline" className="text-[8px] font-black uppercase py-0 px-2 opacity-50 bg-transparent border-white/10">{item.type}</Badge>
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.sub}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.type === 'track' ? (
                          <div className="p-2 bg-blue-500 text-white rounded-full">
                            <Play className="h-3 w-3 fill-current" />
                          </div>
                        ) : (
                          <div className="p-2 bg-foreground/10 text-foreground rounded-full">
                            <ArrowUpRight className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : !isLoading && (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Zero match identifiers found in sector</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SonicSearchSection;
