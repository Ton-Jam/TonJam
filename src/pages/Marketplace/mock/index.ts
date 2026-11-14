import { NFTItem } from "@/types";
import { NFTCollection, LiveAuction, LeaderboardUser, RecentSale, GenreCategory, MarketplaceStats } from "../types";

export const MOCK_ARTISTS: LeaderboardUser[] = [];

export const MOCK_USERS: LeaderboardUser[] = [];

export const MOCK_COLLECTIONS: NFTCollection[] = [];

export const MOCK_TRACKS: NFTItem[] = [];

export const MOCK_AUCTIONS: LiveAuction[] = [];

export const MOCK_SALES: RecentSale[] = [];

export const GENRE_CATEGORIES: GenreCategory[] = [];

export const MOCK_STATS: MarketplaceStats = {
  volumeTotal: "0 TON",
  volumeChange24h: "0%",
  dailySalesCount: 0,
  weeklySalesCount: 0,
  monthlySalesCount: 0,
  totalOwners: 0,
  floorPrice: "0 TON",
  highestSale: "0 TON"
};
