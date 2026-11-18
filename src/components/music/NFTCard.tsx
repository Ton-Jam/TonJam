import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, Gavel, Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';
import { NFTItem } from '@/types';
import { AlbumArtwork } from './AlbumArtwork';
import VerifiedArtistBadge, { checkIsArtistVerified } from '@/components/common/VerifiedArtistBadge';
import { TON_LOGO } from '@/constants';
import { cn } from '@/lib/utils';

export type NFTCardVariant = 'sale' | 'auction' | 'owned' | 'sold';

export interface NFTCardProps {
  nft: NFTItem;
  variant?: NFTCardVariant;
  showVerified?: boolean;
  showRarity?: boolean;
  showEdition?: boolean;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (nft: NFTItem) => void;
  onViewNFT?: (nft: NFTItem) => void;
  onAction?: (nft: NFTItem) => void;
  className?: string;
}

const RARITY_COLORS: Record<string, { text: string; bg: string }> = {
  legendary: { text: 'text-[#FFC857]', bg: 'bg-[#493516]' },
  epic: { text: 'text-[#9B7CFF]', bg: 'bg-[#2E1065]' },
  rare: { text: 'text-[#00B4D8]', bg: 'bg-[#0B3A53]' },
  common: { text: 'text-[#C2C7CD]', bg: 'bg-[#19273D]' },
  '1/1': { text: 'text-[#F472B6]', bg: 'bg-[#4A1535]' },
};

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  variant: forcedVariant,
  showVerified = true,
  showRarity = true,
  showEdition = true,
  showFavorite = true,
  isFavorite: externalIsFavorite,
  onFavoriteToggle,
  onViewNFT,
  onAction,
  className = '',
}) => {
  const navigate = useNavigate();
  const [internalFavorite, setInternalFavorite] = useState(false);

  const isFavorite = externalIsFavorite !== undefined ? externalIsFavorite : internalFavorite;

  // Determine variant automatically if not explicitly provided
  const variant: NFTCardVariant = forcedVariant || (() => {
    if (nft.isAuction || nft.listingType === 'auction') return 'auction';
    if (nft.price === '0' || (nft.supply && nft.minted && nft.minted >= nft.supply && !nft.price)) return 'sold';
    return 'sale';
  })();

  const artistName = nft.artist || nft.creator || 'TonJam Artist';
  const isVerified = showVerified && (
    nft.artistVerified ||
    checkIsArtistVerified(artistName, nft.artistVerified)
  );

  const editionText = nft.edition
    ? (nft.edition.toLowerCase().includes('of') ? nft.edition : `Edition ${nft.edition}`)
    : (nft.supply ? `1 of ${nft.supply}` : null);

  const rarityKey = (nft.rarity || 'rare').toLowerCase();
  const rarityTheme = RARITY_COLORS[rarityKey] || RARITY_COLORS.rare;
  const collectionName = (nft as any).collectionName as string | undefined;

  const handleCardClick = () => {
    if (onViewNFT) {
      onViewNFT(nft);
    } else {
      navigate(`/nft/${nft.id}`);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(nft);
    } else {
      setInternalFavorite((prev) => !prev);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction(nft);
    } else {
      handleCardClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={cn(
        'group relative flex flex-col p-2.5 rounded-[var(--tj-radius-compact,5px)] transition-colors duration-150 select-none cursor-pointer',
        'bg-[var(--tj-color-surface-default,#0B1424)] hover:bg-[var(--tj-color-surface-hover,#132B49)] active:bg-[var(--tj-color-surface-pressed,#193657)]',
        'border border-[var(--tj-color-border-subtle)] hover:border-[var(--tj-color-border-strong)]',
        className
      )}
      data-testid="music-nft-card"
      data-nft-id={nft.id}
      data-variant={variant}
    >
      {/* Square NFT Artwork */}
      <div className="relative w-full aspect-square rounded-[var(--tj-radius-compact,5px)] overflow-hidden mb-2.5 border border-[var(--tj-color-border-subtle)] bg-[var(--tj-color-bg-secondary,#0B1424)]">
        <AlbumArtwork
          src={nft.imageUrl || nft.coverUrl}
          alt={nft.title}
          shape="square"
          size="standard"
          fallbackType="nft"
          showPlayOverlay={false}
          className="w-full h-full max-w-none transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Top Badges: Music NFT Label & Optional Rarity */}
        <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[var(--tj-radius-compact,5px)] text-[10px] font-semibold uppercase tracking-wider text-[var(--tj-color-text-primary,#F8FAFC)] bg-[var(--tj-color-surface-overlay,#07182BCC)] border border-[var(--tj-color-border-subtle)]">
            Music NFT
          </span>

          {showRarity && nft.rarity && (
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-[var(--tj-radius-compact,5px)] text-[10px] font-semibold uppercase tracking-wider border border-[var(--tj-color-border-subtle)]',
                rarityTheme.text,
                rarityTheme.bg
              )}
            >
              {nft.rarity}
            </span>
          )}
        </div>

        {/* Top Right: Favorite Button */}
        {showFavorite && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={cn(
              'absolute top-1.5 right-1.5 z-20 w-8 h-8 flex items-center justify-center rounded-[var(--tj-radius-compact,5px)] bg-[var(--tj-color-surface-overlay,#07182BCC)] border border-[var(--tj-color-border-subtle)] transition-colors duration-150 cursor-pointer',
              isFavorite
                ? 'text-[var(--tj-color-state-danger,#F87171)] border-[var(--tj-color-state-danger,#F87171)]'
                : 'text-[var(--tj-color-text-primary,#F8FAFC)] hover:text-[var(--tj-color-brand-primary,#229ED9)] hover:border-[var(--tj-color-border-strong)]'
            )}
          >
            <Heart className={cn('w-3.5 h-3.5', isFavorite && 'fill-current')} />
          </button>
        )}

        {/* Bottom Badge inside artwork: Edition Indicator (only when available) */}
        {showEdition && editionText && (
          <div className="absolute bottom-1.5 left-1.5 z-20 pointer-events-none">
            <span className="px-1.5 py-0.5 rounded-[var(--tj-radius-compact,5px)] text-[10px] font-mono font-medium text-[var(--tj-color-text-secondary,#A8B7CC)] bg-[var(--tj-color-surface-overlay,#07182BCC)] border border-[var(--tj-color-border-subtle)]">
              {editionText}
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <h4 className="text-xs sm:text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] truncate transition-colors duration-150">
          {nft.title}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
          <span className="truncate">{artistName}</span>
          {isVerified && <VerifiedArtistBadge isVerified={true} size="xs" className="shrink-0" />}
        </div>

        {collectionName && (
          <span className="text-[10px] text-[var(--tj-color-text-muted,#7F91AA)] truncate">
            {collectionName}
          </span>
        )}

        {/* Pricing & State Variant Row */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[var(--tj-color-border-subtle)]">
          {variant === 'sale' && (
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--tj-color-text-muted,#7F91AA)]">
                Price
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5 object-contain shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] tabular-nums truncate">
                  {nft.price} TON
                </span>
                {typeof nft.floorPriceChange === 'number' && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-[var(--tj-radius-compact,5px)] tabular-nums inline-flex items-center',
                      nft.floorPriceChange >= 0
                        ? 'bg-[var(--tj-color-state-success-bg,#103B32)] text-[var(--tj-color-state-success,#34D399)]'
                        : 'bg-[var(--tj-color-state-danger-bg,#451F2A)] text-[var(--tj-color-state-danger,#F87171)]'
                    )}
                  >
                    {nft.floorPriceChange >= 0
                      ? `+${nft.floorPriceChange}%`
                      : `${nft.floorPriceChange}%`}
                  </span>
                )}
              </div>
            </div>
          )}

          {variant === 'auction' && (
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--tj-color-state-warning,#FFC857)] flex items-center gap-1">
                <Gavel className="w-3 h-3 text-[var(--tj-color-state-warning,#FFC857)] shrink-0" />
                Auction Active
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5 object-contain shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] tabular-nums truncate">
                  {nft.startingBid || nft.price || '0.5'} TON
                </span>
                {typeof nft.floorPriceChange === 'number' && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-[var(--tj-radius-compact,5px)] tabular-nums inline-flex items-center',
                      nft.floorPriceChange >= 0
                        ? 'bg-[var(--tj-color-state-success-bg,#103B32)] text-[var(--tj-color-state-success,#34D399)]'
                        : 'bg-[var(--tj-color-state-danger-bg,#451F2A)] text-[var(--tj-color-state-danger,#F87171)]'
                    )}
                  >
                    {nft.floorPriceChange >= 0
                      ? `+${nft.floorPriceChange}%`
                      : `${nft.floorPriceChange}%`}
                  </span>
                )}
              </div>
            </div>
          )}

          {variant === 'owned' && (
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--tj-color-state-success,#34D399)] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[var(--tj-color-state-success,#34D399)] shrink-0" />
                Owned by you
              </span>
              <span className="text-xs text-[var(--tj-color-text-muted,#7F91AA)] mt-0.5">In Wallet</span>
            </div>
          )}

          {variant === 'sold' && (
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--tj-color-text-disabled,#64748B)]">
                Status
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[var(--tj-color-text-disabled,#64748B)] mt-0.5">
                Sold Out
              </span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleActionClick}
            className={cn(
              'min-h-[32px] px-2.5 py-1 rounded-[var(--tj-radius-compact,5px)] text-xs font-semibold transition-colors duration-150 flex items-center gap-1.5 shrink-0 select-none border cursor-pointer',
              variant === 'sale' &&
                'bg-[var(--tj-color-brand-primary,#229ED9)] hover:bg-[var(--tj-color-brand-hover,#21C2E8)] border-[var(--tj-color-brand-primary,#229ED9)] text-white',
              variant === 'auction' &&
                'bg-[var(--tj-color-state-warning,#FFC857)] hover:opacity-90 border-[var(--tj-color-state-warning,#FFC857)] text-[var(--tj-text-inverse,#07111F)]',
              variant === 'owned' &&
                'bg-[var(--tj-color-state-success-bg,#103B32)] hover:opacity-90 border-[var(--tj-color-border-subtle)] text-[var(--tj-color-state-success,#34D399)]',
              variant === 'sold' &&
                'bg-[var(--tj-color-surface-elevated,#111C30)] border-[var(--tj-color-border-subtle)] text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-white'
            )}
            data-testid="nft-action-button"
          >
            {variant === 'sale' && (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>View NFT</span>
              </>
            )}
            {variant === 'auction' && (
              <>
                <Gavel className="w-3.5 h-3.5" />
                <span>Place Bid</span>
              </>
            )}
            {variant === 'owned' && (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Manage</span>
              </>
            )}
            {variant === 'sold' && (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Details</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
