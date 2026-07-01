import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Store, Flame, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

interface NoResultsStateProps {
  query?: string;
  onReset?: () => void;
  className?: string;
}

export const NoResultsState: React.FC<NoResultsStateProps> = ({
  query,
  onReset,
  className = "",
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`w-full flex flex-col items-center justify-center py-20 px-4 text-center max-w-xl mx-auto rounded-3xl border border-white/5 bg-gradient-to-b from-[#0e1b42]/40 to-transparent shadow-2xl backdrop-blur-sm ${className}`}
    >
      {/* Animated Glowing Icon Orb */}
      <div className="relative mb-8 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-28 h-28 bg-blue-500/20 blur-3xl rounded-full"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute w-24 h-24 rounded-full border border-dashed border-blue-400/20"
        />
        <div className="relative z-10 w-20 h-20 rounded-2xl bg-[#132354]/80 border border-blue-500/30 flex items-center justify-center shadow-[inset_0_2px_12px_rgba(59,130,246,0.3)]">
          <Search className="w-9 h-9 text-blue-400" strokeWidth={1.5} />
          <Sparkles className="w-4 h-4 text-amber-400 absolute top-2 right-2 animate-pulse" />
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-2 mb-8">
        <h3 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
          No Results Found
        </h3>
        <p className="text-slate-400 text-sm max-w-md font-medium leading-relaxed">
          {query ? (
            <>
              We searched across all tracks, artists, and playlists but couldn&apos;t find anything matching <span className="text-white font-bold">&quot;{query}&quot;</span>.
            </>
          ) : (
            "We couldn't find any items matching your current filters in this section."
          )}
        </p>
        <p className="text-xs text-slate-500 pt-1">
          Try checking for typos or jump straight into our most active hubs:
        </p>
      </div>

      {/* Suggested Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
        <Button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-6 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide shadow-lg shadow-blue-600/25 transition-all group border border-blue-400/30 cursor-pointer"
        >
          <Store className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
          <span>Marketplace</span>
          <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </Button>

        <Button
          type="button"
          onClick={() => navigate('/trending-nfts')}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-6 px-5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-200 hover:text-white font-bold tracking-wide transition-all border border-orange-500/30 group cursor-pointer"
        >
          <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
          <span>Trending NFTs</span>
        </Button>
      </div>

      {/* Optional Reset Button */}
      {onReset && (
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="mt-5 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Search Query</span>
        </Button>
      )}
    </motion.div>
  );
};

export default NoResultsState;
