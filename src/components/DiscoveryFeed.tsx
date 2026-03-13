import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, Zap, Gem, ChevronRight, Play } from 'lucide-react';
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
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Personalized Tracks Feed */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Personalized Signals</h2>
              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Based on your neural patterns</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => playAll(recommendedTracks)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-foreground rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              <Play className="h-3 w-3 fill-current" /> Play Mix
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedTracks.slice(0, 6).map((track, idx) => (
            <div 
              key={track.id} 
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <TrackCard track={track} variant="row" />
            </div>
          ))}
        </div>
      </section>

      {/* Up-and-Coming / Trending NFTs */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Emerging Artifacts</h2>
              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Trending NFTs in your sector</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/marketplace')}
            className="text-[10px] font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest flex items-center gap-1"
          >
            Marketplace <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {recommendedNFTs.slice(0, 5).map((nft, idx) => (
            <div 
              key={nft.id} 
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${idx * 100 + 300}ms` }}
            >
              <NFTCard nft={nft} />
            </div>
          ))}
        </div>
      </section>

      {/* Discovery Insights / Social Signals */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass border border-blue-500/10 bg-foreground/[0.02] p-6 rounded-[10px] relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-16 w-16 text-blue-500" />
          </div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-2">Sonic Velocity</h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-4">
            We've detected a 42% increase in engagement for artists you follow. New frequencies are being forged in your preferred genres.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 bg-muted/50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[42%]"></div>
            </div>
            <span className="text-[9px] font-mono text-blue-400">+42%</span>
          </div>
        </div>

        <div className="glass border border-purple-500/10 bg-foreground/[0.02] p-6 rounded-[10px] relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Gem className="h-16 w-16 text-purple-500" />
          </div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-2">Artifact Scarcity</h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-4">
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
