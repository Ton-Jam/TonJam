import React from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { FeedTab } from '@/hooks/useJamSpaceFeed';

interface JamFeedHeaderProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const JamFeedHeader: React.FC<JamFeedHeaderProps> = ({
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing,
  searchQuery = '',
  onSearchChange
}) => {
  return (
    <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#030B17]/85 pt-1 pb-2">
      <div className="flex items-center justify-between gap-4">
        {/* Primary Feed Tabs: For You & Following */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-full">
          <button
            type="button"
            onClick={() => onTabChange('for-you')}
            className={`min-h-[40px] px-5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'for-you'
                ? 'bg-[#0088CC] text-white shadow-md shadow-[#0088CC]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            For You
          </button>

          <button
            type="button"
            onClick={() => onTabChange('following')}
            className={`min-h-[40px] px-5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'following'
                ? 'bg-[#0088CC] text-white shadow-md shadow-[#0088CC]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Following
          </button>
        </div>

        {/* Search & Refresh Actions */}
        <div className="flex items-center gap-2">
          {onSearchChange && (
            <div className="relative hidden sm:block w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white/[0.04] pl-9 pr-3 py-1.5 rounded-full text-xs text-white placeholder:text-zinc-500 outline-none focus:bg-white/[0.08] transition-colors"
              />
            </div>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh Feed"
            aria-label="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00B4D8]' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
