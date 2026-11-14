import {
  ArtistStats,
  ArtistPost,
  ArtistEvent,
  TopSupporter,
  ArtistMission,
  ArtistAnalyticsData,
  AlbumData,
  NFTCollectionData,
  PlaylistData,
  MutualFollower
} from "../types";
import { Track } from "@/types";

export const getArtistStats = (_artistId: string): ArtistStats => ({
  monthlyListeners: 0,
  followers: 0,
  following: 0,
  streams: 0,
  albumsCount: 0,
  singlesCount: 0,
  playlistsCount: 0,
  nftCollectionsCount: 0,
  nftOwnersCount: 0,
  floorPrice: "0 TON",
  totalSales: "0 TON"
});

export const getMockAlbums = (_artistId: string): AlbumData[] => [];

export const getMockSingles = (_artistId: string): Track[] => [];

export const getMockCollections = (_artistId: string): NFTCollectionData[] => [];

export const getMockPlaylists = (_artistId: string): PlaylistData[] => [];

export const getMockPosts = (): ArtistPost[] => [];

export const getMockEvents = (_artistId: string): ArtistEvent[] => [];

export const getMockMutualFollowers = (): MutualFollower[] => [];

export const getTopSupporters = (): TopSupporter[] => [];

export const getArtistMissions = (): ArtistMission[] => [];

export const getMockAnalytics = (): ArtistAnalyticsData => ({
  monthlyStreams: [],
  followersGrowth: [],
  nftSales: [],
  revenue: [],
  listeningCountries: [],
  topCities: [],
  mostStreamedSongs: [],
  mostOwnedNFTs: []
});
