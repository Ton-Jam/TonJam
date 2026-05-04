import React, { useState } from 'react';
import { Search, Loader2, Disc, User, Gem, Sparkles, Navigation, Play, ArrowUpRight, X, Terminal, Cpu } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { globalAISearch } from '@/services/geminiService';
import { ButtonGroupInput } from './ButtonGroupInput';
import { Track, Artist } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';

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

  const resetSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestion('');
    setHasSearched(false);
  };

  return (
    <Card className="relative overflow-hidden bg-background/40 backdrop-blur-xl border-blue-500/20 rounded-[24px] shadow-2xl mb-8 group/section">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -z-10 group-hover/section:bg-blue-600/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] -z-10 group-hover/section:bg-purple-600/10 transition-all duration-700" />
      
      {/* Digital Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      
      <CardHeader className="p-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-xl">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">Sonic Core</CardTitle>
                <CardDescription className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                  <Terminal className="h-3 w-3" />
                  Neural Semantic Engine 4.0
                </CardDescription>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['Ambient techno vibe', 'Neon NFT collection', 'Top pop artists'].map((hint) => (
              <Button 
                key={hint}
                variant="outline"
                size="sm"
                onClick={() => { setQuery(hint); }}
                className="h-8 text-[9px] font-black text-blue-500/80 hover:text-white hover:bg-blue-600 hover:border-blue-500 uppercase tracking-widest px-4 bg-blue-500/5 rounded-full transition-all border-blue-500/10 shadow-none"
              >
                {hint}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 pt-4 space-y-8">
        <div className="relative group">
          <ButtonGroupInput 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe the sound, mood, or artifact you seek..."
            className="flex-1"
            inputClassName="bg-white/[0.03] border border-white/5 h-16 px-6 text-sm font-medium text-foreground outline-none focus-visible:ring-1 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/30 transition-all rounded-2xl placeholder:text-muted-foreground/30 shadow-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            onSearch={handleSearch}
          />
          {hasSearched && !isLoading && (
            <Button
              variant="ghost"
              size="icon"
              onClick={resetSearch}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-500 h-8 w-8 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                <Skeleton className="h-3 w-48 bg-blue-500/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white/[0.03]" />
                ))}
              </div>
            </motion.div>
          ) : hasSearched && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {suggestion && (
                <div className="flex items-start gap-4 p-5 bg-blue-500/10 border border-blue-500/20 rounded-[20px] relative overflow-hidden group/suggestion">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/suggestion:opacity-30 transition-opacity">
                    <Sparkles className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  </div>
                  <p className="text-xs font-bold leading-relaxed tracking-tight text-foreground/90">
                    <span className="text-blue-500 mr-2 font-black uppercase tracking-widest text-[9px]">Insight:</span>
                    {suggestion}
                  </p>
                </div>
              )}

              {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((item, idx) => (
                    <motion.div 
                      key={`${item.type}-${item.id}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-blue-500/40 transition-all cursor-pointer shadow-lg active:scale-[0.98]"
                      onClick={() => handleAction(item)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`p-4 rounded-xl border border-white/5 shadow-inner ${
                            item.type === 'track' ? 'bg-blue-600/20 text-blue-400' :
                            item.type === 'artist' ? 'bg-rose-600/20 text-rose-400' :
                            'bg-emerald-600/20 text-emerald-400'
                          }`}>
                            {item.type === 'track' ? <Disc className="h-5 w-5" /> : 
                             item.type === 'artist' ? <User className="h-5 w-5" /> : 
                             <Gem className="h-5 w-5" />}
                          </div>
                   
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black uppercase tracking-tighter text-foreground group-hover:text-blue-400 transition-colors">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[7px] font-black uppercase py-0 px-2 rounded-sm bg-background/50 border-white/10 text-muted-foreground">{item.type}</Badge>
                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest truncate max-w-[120px]">{item.sub}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {item.type === 'track' ? (
                          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                            <Play className="h-3.5 w-3.5 fill-current" />
                          </div>
                        ) : (
                          <div className="p-2.5 bg-white/10 text-white rounded-xl border border-white/10">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : !isLoading && (
                <div className="py-16 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-muted/20 rounded-full">
                      <X className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Null Signal Identification</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default SonicSearchSection;
