import React, { useState } from 'react';
import { RefreshCw, Search, X, Sparkles } from 'lucide-react';
import { FeedTab } from '@/hooks/useJamSpaceFeed';

export type FeedContentFilter = 'all' | 'tracks' | 'nfts' | 'media' | 'quotes';

interface JamFeedHeaderProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  contentFilter?: FeedContentFilter;
  onContentFilterChange?: (filter: FeedContentFilter) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  hasNewPosts?: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const FILTER_OPTIONS: { id: FeedContentFilter; label: string }[] = [
  { id: 'all', label: 'All Signals' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'nfts', label: 'NFT Drops' },
  { id: 'media', label: 'Media' },
  { id: 'quotes', label: 'Quotes' }
];

export const JamFeedHeader: React.FC<JamFeedHeaderProps> = ({
  activeTab,
  onTabChange,
  contentFilter = 'all',
  onContentFilterChange,
  onRefresh,
  isRefreshing,
  hasNewPosts = false,
  searchQuery = '',
  onSearchChange
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <div
      style={{
        background: 'var(--tj-header-bg, transparent)',
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none'
      }}
      className="sticky top-0 z-30 bg-transparent backdrop-blur-none backdrop-filter-none pt-1 pb-2 space-y-2 border-none"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Primary Feed Tabs: For You & Following */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-full">
          <button
            type="button"
            onClick={() => onTabChange('for-you')}
            className={`min-h-[38px] px-4 sm:px-5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer border-none ${
              activeTab === 'for-you'
                ? 'bg-[var(--tj-color-accent-primary,#0088CC)] text-white shadow-md shadow-[#0088CC]/25'
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
          >
            For You
          </button>

          <button
            type="button"
            onClick={() => onTabChange('following')}
            className={`min-h-[38px] px-4 sm:px-5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer border-none ${
              activeTab === 'following'
                ? 'bg-[var(--tj-color-accent-primary,#0088CC)] text-white shadow-md shadow-[#0088CC]/25'
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
          >
            Following
          </button>
        </div>

        {/* Search & Refresh Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onSearchChange && (
            <>
              {/* Desktop inline search */}
              <div className="relative hidden sm:block w-52 lg:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search posts, #tags..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  aria-label="Search JamSpace posts"
                  className="w-full bg-white/[0.05] pl-9 pr-8 py-2 rounded-full text-xs text-white placeholder:text-zinc-500 outline-none focus:bg-white/[0.09] transition-colors border-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-white rounded-full border-none bg-transparent cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile search toggle */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
                aria-label={mobileSearchOpen ? 'Close search' : 'Search JamSpace posts'}
                className={`sm:hidden min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full transition-all cursor-pointer border-none ${
                  mobileSearchOpen || searchQuery
                    ? 'bg-[var(--tj-color-accent-primary,#0088CC)]/20 text-[#00B4D8]'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95 disabled:opacity-50 border-none"
            title="Refresh Feed"
            aria-label="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00B4D8]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {onSearchChange && (mobileSearchOpen || searchQuery.length > 0) && (
        <div className="sm:hidden relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search posts, creators, #tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Mobile search JamSpace posts"
            className="w-full bg-white/[0.06] pl-9 pr-9 py-2 rounded-full text-xs text-white placeholder:text-zinc-500 outline-none focus:bg-white/[0.1] transition-colors border-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear mobile search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white rounded-full border-none bg-transparent cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Horizontal Content Filter Chips */}
      {onContentFilterChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = contentFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onContentFilterChange(opt.id)}
                style={{
                  backgroundColor: isActive
                    ? 'var(--tj-color-chip-active-bg, rgba(0, 180, 216, 0.18))'
                    : 'var(--tj-color-chip-bg, rgba(255, 255, 255, 0.04))',
                  color: isActive
                    ? 'var(--tj-color-chip-active-text, #FFFFFF)'
                    : 'var(--tj-color-chip-text, #A1A1AA)'
                }}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-none hover:text-white active:scale-95"
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* New Posts Realtime Pill */}
      {hasNewPosts && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onRefresh}
            className="px-4 py-1.5 rounded-full bg-[var(--tj-color-accent-primary,#0088CC)] text-white text-xs font-bold shadow-lg shadow-[#0088CC]/30 flex items-center gap-1.5 hover:opacity-95 active:scale-95 transition-all cursor-pointer border-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New transmissions · Tap to load</span>
          </button>
        </div>
      )}
    </div>
  );
};

