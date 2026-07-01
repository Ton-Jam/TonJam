import { Track, NFTItem, Artist, Playlist, UserProfile } from '@/types';

export interface SearchState {
  query: string;
  activeFilter: string;
  isFocused: boolean;
  history: string[];
  suggestions: string[];
}

export interface CollectionItem {
  id: string;
  name: string;
  creator: string;
  coverUrl: string;
  itemsCount: number;
  ownersCount: number;
  floorPrice: string;
  totalVolume: string;
}

export interface LiveAuctionItem {
  id: string;
  nftId: string;
  title: string;
  artist: string;
  coverUrl: string;
  highestBid: string;
  endTime: string;
  bidsCount: number;
}
