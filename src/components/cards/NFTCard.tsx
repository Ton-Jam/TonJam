import React from 'react';
import { NFTCard as CanonicalNFTCard, NFTCardProps as CanonicalNFTCardProps } from '@/components/NFTCard';
import { NFTItem } from '@/types';

export interface NFTData {
  id: string;
  title: string;
  creator: string;
  imageUrl: string;
  price: string; // Floor Price in TON
  highestBid?: string; // Highest Bid in TON
  ownersCount?: number;
  supplyTotal?: number;
  supplyMinted?: number;
  mintStatus?: 'open' | 'sold_out' | 'paused';
  auctionEndsAt?: string; // ISO date or descriptive string
  isLiked?: boolean;
  isBookmarked?: boolean;
  isLiveAuction?: boolean;
  isVerified?: boolean;
  history?: any[];
  listingType?: 'fixed' | 'auction';
}

export interface NFTCardProps {
  nft?: NFTItem | NFTData;
  variant?: 'default' | 'row';
  isLoading?: boolean;
  onMint?: (nft: any) => void;
  onBid?: (nft: any) => void;
  onCollect?: (nft: any) => void;
  onLike?: (nft: any) => void;
  onBookmark?: (nft: any) => void;
  onAction?: (nft: any) => void;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (nft: any) => void;
  currencyMode?: 'TON' | 'USD';
  className?: string;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  variant = 'default',
  isLoading = false,
  onMint,
  onBid,
  onCollect,
  onLike,
  onBookmark,
  onAction,
  isSelectedForCompare,
  onToggleCompare,
  currencyMode,
  className = '',
}) => {
  if (!nft && !isLoading) return null;

  const canonicalNFT: NFTItem = nft ? ({
    id: nft.id,
    trackId: (nft as any).trackId || nft.id,
    title: nft.title,
    owner: (nft as any).owner || (nft as any).creator,
    creator: (nft as any).creator || (nft as any).artist || '',
    artist: (nft as any).artist || (nft as any).creator || '',
    price: (nft as any).price || '0 TON',
    imageUrl: (nft as any).imageUrl || (nft as any).coverUrl || '',
    coverUrl: (nft as any).coverUrl || (nft as any).imageUrl || '',
    edition: (nft as any).edition || 'Limited Edition',
    type: 'track',
    url: '',
    listingType: (nft as any).listingType || ((nft as any).isLiveAuction ? 'auction' : 'fixed'),
    auctionEndTime: (nft as any).auctionEndTime || (nft as any).auctionEndsAt,
  } as NFTItem) : ({} as NFTItem);

  return (
    <CanonicalNFTCard
      nft={canonicalNFT}
      variant={variant}
      isLoading={isLoading}
      onAction={onAction || onCollect || onMint}
      isSelectedForCompare={isSelectedForCompare}
      onToggleCompare={onToggleCompare}
      currencyMode={currencyMode}
      className={className}
    />
  );
};

export default NFTCard;
