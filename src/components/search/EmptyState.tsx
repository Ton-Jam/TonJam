import React from 'react';
import { motion } from 'motion/react';
import { Search, Music, Sparkles, Gem, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  variant: 'no-history' | 'no-results';
  query?: string;
  onClearQuery?: () => void;
  onTriggerTrending?: () => void;
  onNavigateNFTs?: () => void;
  onNavigateArtists?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  query,
  onClearQuery,
  onTriggerTrending,
  onNavigateNFTs,
  onNavigateArtists
}) => {
  if (variant === 'no-history') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="py-12 px-6 rounded-xl bg-[#090f2d] text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto"
      >
        <div className="w-14 h-14 rounded-full bg-[#132354] flex items-center justify-center text-[#0052FF]">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Your Wave is Waiting</h3>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed">
            Search songs, albums, verified creators, collections, and live TON auction signals.
          </p>
        </div>

        {onTriggerTrending && (
          <Button
            size="sm"
            onClick={onTriggerTrending}
            className="text-[9px] font-bold uppercase tracking-widest bg-[#0052FF] text-white hover:bg-[#0052FF]/85 rounded-lg h-8 px-4"
          >
            Explore Trending Music
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="py-16 px-6 rounded-xl bg-[#090f2d] text-center flex flex-col items-center justify-center space-y-6 max-w-lg mx-auto"
    >
      <div className="w-14 h-14 rounded-full bg-[#132354] flex items-center justify-center text-red-400">
        <Search className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">No Results Found</h3>
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed">
          We scanned all audio contracts and social channels but found no match for <span className="text-[#0052FF] font-black">"{query}"</span>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center w-full">
        {onNavigateArtists && (
          <Button
            size="sm"
            variant="outline"
            onClick={onNavigateArtists}
            className="text-[8px] font-mono font-bold uppercase tracking-widest bg-transparent text-white hover:bg-white/5 border border-white/10 rounded-lg h-8 px-3"
          >
            <User className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            Browse Artists
          </Button>
        )}

        {onNavigateNFTs && (
          <Button
            size="sm"
            variant="outline"
            onClick={onNavigateNFTs}
            className="text-[8px] font-mono font-bold uppercase tracking-widest bg-transparent text-white hover:bg-white/5 border border-white/10 rounded-lg h-8 px-3"
          >
            <Gem className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
            Browse NFTs
          </Button>
        )}

        {onClearQuery && (
          <Button
            size="sm"
            onClick={onClearQuery}
            className="text-[8px] font-mono font-bold uppercase tracking-widest bg-[#0052FF] text-white hover:bg-[#0052FF]/85 rounded-lg h-8 px-3"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-white animate-spin-slow" />
            Reset Query
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
