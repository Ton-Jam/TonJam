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
        className="py-12 px-6 rounded-2xl bg-white/[0.03] text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto select-none"
      >
        <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center text-[#00B4D8]">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Your Wave is Waiting</h3>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest max-w-sm leading-relaxed">
            Search songs, albums, verified creators, collections, and live TON auction signals.
          </p>
        </div>

        {onTriggerTrending && (
          <Button
            size="sm"
            onClick={onTriggerTrending}
            className="text-[9px] font-bold uppercase tracking-widest bg-[#00B4D8] text-black hover:bg-[#00B4D8]/85 rounded-full h-8 px-4"
          >
            Explore Trending Music
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="min-h-[50vh] w-full flex flex-col items-center justify-center text-center px-4 py-16 select-none"
    >
      <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center text-zinc-400 mb-4">
        <Search className="w-6 h-6 stroke-[1.75]" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
          {query ? `No results found for "${query}"` : 'No results found'}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Please check your spelling or try searching for another track, artist, album, playlist, or collectible.
        </p>
      </div>

      {onClearQuery && (
        <div className="mt-5">
          <Button
            size="sm"
            onClick={onClearQuery}
            className="text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-white hover:text-white rounded-full h-9 px-4 border-none transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
            Clear Search
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
