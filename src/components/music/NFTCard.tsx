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
    : (nft.supply ? `1 of ${nft.supply}` : '1 of 25');

  const rarityKey = (nft.rarity || 'rare').toLowerCase();
  const rarityTheme = RARITY_COLORS[rarityKey] || RARITY_COLORS.rare;

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
        'group relative flex flex-col p-3 rounded-[16px] transition-all duration-200 select-none cursor-pointer',
        'bg-[#0F1C32] hover:bg-[#132B49] active:bg-[#193657]',
        'shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(0,180,216,0.15)]',
        className
      )}
      data-testid="music-nft-card"
      data-nft-id={nft.id}
      data-variant={variant}
    >
      {/* Square NFT Artwork */}
      <div className="relative w-full aspect-square rounded-[12px] overflow-hidden mb-3">
        <AlbumArtwork
          src={nft.imageUrl || nft.coverUrl}
          alt={nft.title}
          shape="rounded"
          size="standard"
          fallbackType="nft"
          showPlayOverlay={false}
          className="w-full h-full max-w-none"
        />

        {/* Top Badges: Music NFT Label & Optional Rarity */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-semibold uppercase tracking-wider text-white bg-black/60 backdrop-blur-md">
            Music NFT
          </span>

          {showRarity && nft.rarity && (
            <span
              className={cn(
                'px-2 py-0.5 rounded-[6px] text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md',
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
              'absolute top-2 right-2 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md transition-transform duration-150 hover:scale-110 active:scale-95',
              isFavorite ? 'text-[#F87171]' : 'text-white hover:text-[#00B4D8]'
            )}
          >
            <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
          </button>
        )}

        {/* Bottom Badge inside artwork: Edition Indicator */}
        {showEdition && (
          <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
            <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-medium text-[#C2C7CD] bg-black/70 backdrop-blur-md">
              {editionText}
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-white truncate transition-colors duration-150 group-hover:text-white">
          {nft.title}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-[#C2C7CD] truncate">
          <span className="truncate">{artistName}</span>
          {isVerified && <VerifiedArtistBadge isVerified={true} size="xs" className="shrink-0" />}
        </div>

        {/* Pricing & State Variant Row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t-0">
          {variant === 'sale' && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-medium tracking-wider text-[#8193A8]">
                Price
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5 object-contain" />
                <span className="text-sm font-bold text-white tabular-nums">
                  {nft.price} TON
                </span>
                {(() => {
                  const change = nft.floorPriceChange ?? 5.4;
                  const isPositive = change >= 0;
                  return (
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.2 rounded-[4px] tabular-nums inline-flex items-center",
                      isPositive ? "bg-[#103B32] text-[#34D399]" : "bg-[#451F2A] text-[#F87171]"
                    )}>
                      {isPositive ? `+${change}%` : `${change}%`}
                    </span>
                  );
                })()}
              </div>
            </div>
          )}

          {variant === 'auction' && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-medium tracking-wider text-[#FFC857] flex items-center gap-1">
                <Gavel className="w-3 h-3 text-[#FFC857]" />
                Auction Active
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5 object-contain" />
                <span className="text-sm font-bold text-white tabular-nums">
                  {nft.startingBid || nft.price || '0.5'} TON
                </span>
                {(() => {
                  const change = nft.floorPriceChange ?? 2.1;
                  const isPositive = change >= 0;
                  return (
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.2 rounded-[4px] tabular-nums inline-flex items-center",
                      isPositive ? "bg-[#103B32] text-[#34D399]" : "bg-[#451F2A] text-[#F87171]"
                    )}>
                      {isPositive ? `+${change}%` : `${change}%`}
                    </span>
                  );
                })()}
              </div>
            </div>
          )}

          {variant === 'owned' && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-medium tracking-wider text-[#34D399] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
                Owned by you
              </span>
              <span className="text-xs text-[#8193A8] mt-0.5">In Wallet</span>
            </div>
          )}

          {variant === 'sold' && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-medium tracking-wider text-[#64748B]">
                Status
              </span>
              <span className="text-sm font-bold text-[#64748B] mt-0.5">
                Sold Out
              </span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleActionClick}
            className={cn(
              'px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 shrink-0 select-none shadow-sm',
              variant === 'sale' && 'bg-[#00B4D8] hover:bg-[#21C2E8] active:bg-[#168AC4] text-white',
              variant === 'auction' && 'bg-[#FFC857] hover:bg-[#E5B03B] active:bg-[#C99622] text-[#07111F]',
              variant === 'owned' && 'bg-[#103B32] hover:bg-[#175346] text-[#34D399]',
              variant === 'sold' && 'bg-[#19273D] text-[#8193A8] hover:text-white'
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
