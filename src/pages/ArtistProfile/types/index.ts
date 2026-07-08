import { Artist, Track, NFTItem } from "@/types";

export interface SocialLinks {
  website?: string;
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  x?: string;
  instagram?: string;
  telegram?: string;
}

export interface ArtistStats {
  monthlyListeners: number;
  followers: number;
  following: number;
  streams: number;
  albumsCount: number;
  singlesCount: number;
  playlistsCount: number;
  nftCollectionsCount: number;
  nftOwnersCount: number;
  floorPrice: string;
  totalSales: string;
}

export interface ArtistPost {
  id: string;
  type: "text" | "image" | "video" | "audio" | "announcement" | "behind-the-scenes" | "studio-update";
  content: string;
  mediaUrl?: string;
  isPinned?: boolean;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked?: boolean;
}

export interface ArtistEvent {
  id: string;
  type: "concert" | "live-space" | "meet-greet" | "nft-drop" | "album-release";
  title: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  ticketUrl?: string;
  price?: string;
  image?: string;
}

export interface TopSupporter {
  id: string;
  name: string;
  avatarUrl: string;
  supportAmount: string; // TJ Coins
  streakDays: number;
  badgeType: "Gold" | "Silver" | "Bronze" | "Collector";
  rank: number;
}

export interface ArtistMission {
  id: string;
  title: string;
  description: string;
  rewardTJ: number;
  progress: number; // 0 to 100
  completed: boolean;
}

export interface ListeningCountry {
  country: string;
  streams: number;
  percentage: number;
  flag: string;
}

export interface ListeningCity {
  city: string;
  streams: number;
}

export interface ArtistAnalyticsData {
  monthlyStreams: { month: string; streams: number }[];
  followersGrowth: { month: string; count: number }[];
  nftSales: { month: string; sales: number }[];
  revenue: { month: string; ton: number; tj: number }[];
  listeningCountries: ListeningCountry[];
  topCities: ListeningCity[];
  mostStreamedSongs: { title: string; streams: number; coverUrl: string }[];
  mostOwnedNFTs: { title: string; owners: number; coverUrl: string }[];
}

export interface AlbumData {
  id: string;
  title: string;
  coverUrl: string;
  releaseYear: number;
  trackCount: number;
  duration: string;
  isNFT?: boolean;
  floorPrice?: string;
  artistId: string;
}

export interface NFTCollectionData {
  id: string;
  name: string;
  coverUrl: string;
  volume: string;
  owners: number;
  items: number;
  floorPrice: string;
  artistId: string;
}

export interface PlaylistData {
  id: string;
  name: string;
  coverUrl: string;
  trackCount: number;
  type: "Official" | "Featured" | "Collaborative";
  plays: number;
}

export interface MutualFollower {
  id: string;
  name: string;
  avatarUrl: string;
}
