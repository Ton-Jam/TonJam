import { NFTItem } from "@/types";

export interface NFTCollection {
  id: string;
  name: string;
  creator: string;
  creatorId: string;
  volume: string; // in TON
  owners: number;
  floorPrice: string; // in TON
  imageUrl: string;
  itemCount: number;
  verified: boolean;
  description?: string;
}

export interface LiveAuction {
  id: string;
  nft: NFTItem;
  currentBid: string; // TON
  highestBidder: string;
  endsAt: string; // ISO string
  minIncrement: string; // TON
  watchers: number;
  bidsCount: number;
  isLive: boolean;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  salesCount?: number;
  revenueTON: string;
  nftsOwnedCount?: number;
  tonSpent?: string;
  followersCount: number;
}

export interface MarketplaceStats {
  volumeTotal: string;
  volumeChange24h: string;
  dailySalesCount: number;
  weeklySalesCount: number;
  monthlySalesCount: number;
  totalOwners: number;
  floorPrice: string;
  highestSale: string;
}

export interface RecentSale {
  id: string;
  nftId: string;
  nftTitle: string;
  nftCoverUrl: string;
  buyerName: string;
  buyerAddress: string;
  sellerName: string;
  sellerAddress: string;
  price: string; // TON
  timestamp: string; // ISO or relative
}

export interface GenreCategory {
  id: string;
  name: string;
  count: string;
  coverUrl: string;
  colorClass: string;
}
