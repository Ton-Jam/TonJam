import React from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, Gem, Play, RotateCcw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

export interface SuggestedQueryOption {
  label: string;
  query: string;
}

interface EmptyStateProps {
  variant: 'no-history' | 'no-results';
  query?: string;
  activeFilter?: string;
  hasOtherFilterMatches?: boolean;
  otherMatchCount?: number;
  onResetFilter?: () => void;
  onClearQuery?: () => void;
  onTriggerTrending?: () => void;
  onNavigateNFTs?: () => void;
  onNavigateArtists?: () => void;
  onSelectSuggestion?: (query: string) => void;
  suggestedQueries?: SuggestedQueryOption[];
  suggestedTracks?: Track[];
  onPlayTrack?: (track: Track) => void;
}

const FILTER_LABELS: Record<string, string> = {
  all: 'results',
  artists: 'artists',
  tracks: 'tracks',
  nfts: 'NFTs',
  playlists: 'playlists',
  albums: 'albums'
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  query,
  activeFilter = 'all',
  hasOtherFilterMatches = false,
  otherMatchCount = 0,
  onResetFilter,
  onClearQuery,
  onTriggerTrending,
  onNavigateNFTs,
  onSelectSuggestion,
  suggestedQueries = [],
  suggestedTracks = [],
  onPlayTrack
}) => {
  if (variant === 'no-history') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="py-12 px-6 rounded-[var(--tj-radius-lg,12px)] bg-white/[0.03] text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto select-none"
      >
        <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center text-[var(--tj-color-brand-primary,#00B4D8)]">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-[var(--tj-color-text-primary,#FFFFFF)]">Your Wave is Waiting</h3>
          <p className="text-xs text-[var(--tj-color-text-secondary,#C2C7CD)] max-w-sm leading-relaxed">
            Search songs, albums, verified creators, collections, and live TON collectibles.
          </p>
        </div>

        {onTriggerTrending && (
          <Button
            size="sm"
            onClick={onTriggerTrending}
            className="text-xs font-medium bg-[var(--tj-color-brand-primary,#00B4D8)] text-[var(--tj-text-inverse,#07111F)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] rounded-full min-h-[40px] px-5 border-0"
          >
            Explore Trending Music
          </Button>
        )}
      </motion.div>
    );
  }

  const trimmedQuery = query?.trim() || '';
  const filterLabel = FILTER_LABELS[activeFilter] || 'results';
  const isFilteredOut = activeFilter !== 'all' && hasOtherFilterMatches;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      data-testid="discover-no-results"
      className="w-full px-3 sm:px-4 pt-6 pb-20 flex flex-col items-center select-none"
    >
      {/* Primary Fallback Card (Borderless TonJam Surface) */}
      <div className="w-full max-w-2xl rounded-[var(--tj-radius-md,10px)] bg-white/[0.03] px-5 py-8 sm:px-8 sm:py-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--tj-color-chip-background,#102943)] flex items-center justify-center text-[var(--tj-color-brand-primary,#00B4D8)] mb-4">
          {isFilteredOut ? (
            <Layers className="w-6 h-6 stroke-[1.75]" />
          ) : (
            <Search className="w-6 h-6 stroke-[1.75]" />
          )}
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-base sm:text-lg font-semibold text-[var(--tj-color-text-primary,#FFFFFF)] tracking-tight text-balance">
            {isFilteredOut
              ? trimmedQuery
                ? `No ${filterLabel} found for "${trimmedQuery}"`
                : `No ${filterLabel} found`
              : trimmedQuery
                ? `No results found for "${trimmedQuery}"`
                : 'No results found'}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--tj-color-text-secondary,#C2C7CD)] leading-relaxed">
            {isFilteredOut
              ? `We found ${otherMatchCount} match${otherMatchCount === 1 ? '' : 'es'} in other categories. Switch back to All or try a different search.`
              : 'Check your spelling, try searching by artist or genre, or explore a suggested sound below.'}
          </p>
        </div>

        {/* Recovery Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {isFilteredOut && onResetFilter && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onResetFilter}
              style={{ borderRadius: 'var(--tj-radius-pill, 999px)' }}
              className="min-h-[44px] px-5 text-xs font-semibold border-0 shadow-none transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Show All Results{otherMatchCount > 0 ? ` (${otherMatchCount})` : ''}
            </Button>
          )}

          {onClearQuery && (
            <Button
              type="button"
              variant={isFilteredOut ? 'secondary' : 'primary'}
              size="sm"
              onClick={onClearQuery}
              style={{ borderRadius: 'var(--tj-radius-pill, 999px)' }}
              className="min-h-[44px] px-5 text-xs font-semibold border-0 shadow-none transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Clear Search
            </Button>
          )}

          {onNavigateNFTs && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onNavigateNFTs}
              style={{ borderRadius: 'var(--tj-radius-pill, 999px)' }}
              className="min-h-[44px] px-5 text-xs font-medium text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white border-0 shadow-none transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Gem className="w-3.5 h-3.5 mr-1.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
              Browse NFT Marketplace
            </Button>
          )}
        </div>

        {/* Interactive Suggested Queries */}
        {suggestedQueries.length > 0 && onSelectSuggestion && (
          <div className="mt-7 w-full space-y-2.5">
            <p className="text-[11px] font-medium text-[var(--tj-color-text-muted,#7F91AA)] uppercase tracking-wider">
              Try searching
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {suggestedQueries.map((item) => (
                <button
                  type="button"
                  key={`fallback-suggestion-${item.query}`}
                  onClick={() => onSelectSuggestion(item.query)}
                  className="border-0 shadow-none min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-medium bg-[var(--tj-color-chip-background,#102943)] hover:bg-[var(--tj-color-surface-hover,#132B49)] text-[var(--tj-color-text-secondary,#C2C7CD)] hover:text-white transition-colors active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real Catalog Fallback Tracks */}
      {suggestedTracks.length > 0 && onPlayTrack && (
        <div className="w-full max-w-2xl mt-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs sm:text-sm font-semibold text-[var(--tj-color-text-primary,#FFFFFF)]">
              Recommended to stream instead
            </h4>
            {onClearQuery && (
              <button
                type="button"
                onClick={onClearQuery}
                className="text-xs font-medium text-[var(--tj-color-brand-primary,#00B4D8)] hover:text-[var(--tj-color-brand-hover,#21C2E8)] transition-colors cursor-pointer"
              >
                Explore all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedTracks.slice(0, 4).map((track) => (
              <button
                type="button"
                key={`fallback-track-${track.id}`}
                onClick={() => onPlayTrack(track)}
                className="w-full text-left p-2.5 rounded-[var(--tj-radius-sm,8px)] bg-white/[0.03] hover:bg-[var(--tj-color-surface-hover,#132B49)] flex items-center gap-3 transition-colors group cursor-pointer border-0 shadow-none"
              >
                <div className="relative w-11 h-11 rounded-[var(--tj-radius-compact,5px)] overflow-hidden bg-zinc-900 shrink-0">
                  <img
                    src={track.coverUrl || getPlaceholderImage(track.title)}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors">
                    {track.title}
                  </p>
                  <p className="text-[11px] text-[var(--tj-color-text-secondary,#C2C7CD)] truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>

                <span className="text-[11px] font-mono tabular-nums text-[var(--tj-color-text-muted,#7F91AA)] shrink-0 pr-1">
                  {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
