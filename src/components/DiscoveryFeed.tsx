import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, Zap, Gem } from 'lucide-react';
import { PlayIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import { useAudio } from '@/context/AudioContext';
import TrackCard from './TrackCard';
import NFTCard from './NFTCard';
import { useNavigate } from 'react-router-dom';

const DiscoveryFeed: React.FC = () => {
  const { getRecommendations, playAll } = useAudio();
  const navigate = useNavigate();
  
  const { recommendedTracks, recommendedNFTs } = useMemo(() => getRecommendations(), [getRecommendations]);

  if (recommendedTracks.length === 0 && recommendedNFTs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pt-6">
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

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
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

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
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

      {/* Discovery Insights / Social Signals */}
      <section className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
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
