import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, Zap, Gem, Play } from 'lucide-react';
import { PlayIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import { useAudio } from '@/context/AudioContext';
import TrackCard from './TrackCard';
import NFTCard from './NFTCard';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const DiscoveryFeed: React.FC = () => {
  const { getRecommendations, playAll, discoverWeekly } = useAudio();
  const navigate = useNavigate();
  
  const { recommendedTracks, recommendedNFTs } = useMemo(() => getRecommendations(), [getRecommendations]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pt-0">
      {/* Discover Weekly Banner - High Fidelity */}
      {discoverWeekly && (
        <section className="mb-4">
          <div 
            onClick={() => navigate(`/playlist/${discoverWeekly.id}`)}
            className="relative h-40 sm:h-72 rounded-3xl overflow-hidden cursor-pointer group shadow-none border border-white/5 bg-background"
          >
            <img 
              src={discoverWeekly.coverUrl} 
              alt="Discover Weekly" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            
            {/* Neural Grid Overlay */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />

            <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-end">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2 sm:space-y-4 max-w-xl">
                  <div className="flex items-center gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] rounded-md text-white px-3 py-1 border-none cursor-help">
                          Neural.Protocol_07
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-950 border-white/10 text-[9px] font-bold uppercase tracking-widest p-2">
                        Proprietary AI synthesis algorithm v7.2.4
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-[0.2em] hidden sm:block">Update_Synced.2024</span>
                  </div>
                  <h2 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter text-white leading-[0.8]">
                    Discover<br />Weekly
                  </h2>
                  <p className="text-xs sm:text-lg text-blue-400 font-extrabold leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
                    Personalized frequency stream synthesized from your unique neural listening patterns and collection data.
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Active Relay</span>
                    <span className="text-[10px] font-bold text-white/80">{discoverWeekly.trackIds?.length || 0} Artists Synced</span>
                  </div>
                  <button className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500 group/play">
                    <Play className="h-6 w-6 sm:h-10 sm:w-10 fill-black translate-x-0.5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Progress Line */}
            <div className="absolute bottom-0 left-0 h-1 bg-blue-600/30 w-full overflow-hidden">
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="h-full w-1/3 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]"
              />
            </div>
          </div>
        </section>
      )}

      {recommendedTracks.length === 0 && recommendedNFTs.length === 0 ? null : (
        <div className="flex flex-col md:flex-row gap-6">
        {/* Personalized Tracks Feed */}
        <section className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-[11px] font-bold text-foreground uppercase tracking-tight font-display">Personalized Signals</h2>
                <p className="text-[7.5px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Based on your neural patterns</p>
              </div>
            </div>
            <button 
              onClick={() => playAll(recommendedTracks)}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-foreground rounded-full transition-all active:scale-95"
            >
              <PlayIcon className="h-4 w-4 text-white" />
            </button>
          </div>

          <div className="scroll-row">
            {recommendedTracks.slice(0, 6).map((track, idx) => (
              <div 
                key={`rec-track-${track.id}-${idx}`} 
                className="min-w-[280px] sm:min-w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <TrackCard track={track} variant="row" />
              </div>
            ))}
          </div>
        </section>

        {/* Up-and-Coming / Trending NFTs */}
        <section className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-[11px] font-bold text-foreground uppercase tracking-tight font-display">Emerging Artifacts</h2>
                <p className="text-[7.5px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Trending NFTs in your sector</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/marketplace')}
              className="p-2 text-amber-500 hover:text-amber-400 transition-colors"
            >
              <ShoppingBagIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="scroll-row">
            {recommendedNFTs.slice(0, 5).map((nft, idx) => (
              <div 
                key={`rec-nft-${nft.id}-${idx}`} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 100 + 300}ms` }}
              >
                <NFTCard nft={nft} />
              </div>
            ))}
          </div>
        </section>
      </div>
      )}

      {/* Discovery Insights / Social Signals */}
      <section className="scroll-row">
        <div className="glass p-4 rounded-sm relative overflow-hidden group transition-all min-w-[280px] sm:min-w-[320px]">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-16 w-16 text-blue-500" />
          </div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-2 font-display">Sonic Velocity</h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
            We've detected a 42% increase in engagement for artists you follow. New frequencies are being forged in your preferred genres.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 bg-muted/50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[42%]"></div>
            </div>
            <span className="text-[9px] font-mono text-blue-400">+42%</span>
          </div>
        </div>

        <div className="glass p-4 rounded-sm relative overflow-hidden group transition-all min-w-[280px] sm:min-w-[320px]">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Gem className="h-16 w-16 text-purple-500" />
          </div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-2 font-display">Artifact Scarcity</h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
            3 NFTs from your recommended artists are nearing floor price liquidation. Market signals suggest high acquisition potential.
          </p>
          <button 
            onClick={() => navigate('/marketplace')}
            className="text-[9px] font-bold text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors"
          >
            Analyze Market Data →
          </button>
        </div>
      </section>
    </div>
  );
};

export default DiscoveryFeed;
