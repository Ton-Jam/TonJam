import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, Pause, Gem, Disc, Radio, TrendingUp, 
  Zap, Calendar, Sparkles, Layers, Award,
  Upload, LayoutDashboard, Coins, ExternalLink,
  Twitter, Instagram, Send, Globe, ChevronRight
} from "lucide-react";
import { UserProfile as UserProfileType, NFTItem, Track } from "@/types";
import { getPlaceholderImage } from "@/lib/utils";
import NFTCard from "@/components/NFTCard";
import PlaylistCard from "@/components/PlaylistCard";
import SocialFeed from "@/components/SocialFeed";
import { ArtistVerificationBadge } from "@/components/ArtistVerificationBadge";

interface ArtistProfileContentProps {
  user: UserProfileType;
  isOwnProfile: boolean;
  activeTab: string;
  tracks: Track[];
  nfts: NFTItem[];
  albums?: any[];
  playlists?: any[];
  posts?: any[];
  stats?: {
    monthlyListeners?: number;
    totalStreams?: number;
    followers?: number;
  };
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  setActiveTab: (tab: string) => void;
  onTipArtist?: () => void;
}

export const ArtistProfileContent: React.FC<ArtistProfileContentProps> = ({
  user,
  isOwnProfile,
  activeTab,
  tracks,
  nfts,
  albums = [],
  playlists = [],
  posts = [],
  stats,
  currentTrack,
  isPlaying,
  playTrack,
  setActiveTab,
  onTipArtist,
}) => {
  const navigate = useNavigate();

  const popularTracks = tracks.slice(0, 5);
  const nftReleases = nfts.filter(nft => nft.creator === user.name || nft.artist === user.name || (nft as any).creatorId === user.uid);
  const displayNFTs = nftReleases.length > 0 ? nftReleases : nfts;

  return (
    <div className="w-full space-y-8">
      {/* 1. Artist Metrics Ribbon (Spotify-Inspired Public Artist Stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#101A3B] p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-[#0052FF]/20 flex items-center justify-center text-[#0098EA] shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Monthly Listeners
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-white">
              {(stats?.monthlyListeners || (user as any).monthlyListeners || 48200).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-[#101A3B] p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Streams
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-white">
              {(stats?.totalStreams || (user as any).totalStreams || 124900).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#101A3B] p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              TonJam Verified
            </span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              Certified Artist <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* OVERVIEW TAB - Spotify-Inspired Public Artist Layout */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          
          {/* Popular Tracks Section */}
          {popularTracks.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <Disc className="w-4 h-4 text-[#0052FF]" />
                  Popular Tracks
                </h3>
                <button
                  onClick={() => setActiveTab("tracks")}
                  className="text-xs font-bold text-[#0098EA] hover:text-blue-300 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  View Discography ({tracks.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {popularTracks.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:hidden">
                          {idx + 1}
                        </span>
                        <div className="w-6 hidden group-hover:flex items-center justify-center text-[#0098EA]">
                          {isCurrent && isPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </div>
                        <img
                          src={track.coverUrl || (track as any).coverArt || getPlaceholderImage(`track-${track.id}`)}
                          alt={track.title}
                          className="w-11 h-11 rounded-xl object-cover bg-slate-900 shrink-0 shadow-md"
                        />
                        <div className="min-w-0">
                          <h4 className={`text-sm font-bold truncate ${isCurrent ? "text-[#0098EA]" : "text-white"}`}>
                            {track.title}
                          </h4>
                          <span className="text-xs text-slate-400 truncate block">
                            {track.playCount ? `${track.playCount.toLocaleString()} plays` : "On-chain track"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-xs font-mono text-slate-400">
                        <span>{track.duration || "3:20"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NFT Releases / Drop Catalog */}
          {displayNFTs.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <Gem className="w-4 h-4 text-purple-400" />
                  NFT Releases & Drops
                </h3>
                <button
                  onClick={() => setActiveTab("nfts")}
                  className="text-xs font-bold text-[#0098EA] hover:text-blue-300 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  View All ({displayNFTs.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {displayNFTs.slice(0, 3).map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            </div>
          )}

          {/* Discography / Albums & Playlists */}
          {playlists.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Albums & Releases
                </h3>
                <button
                  onClick={() => setActiveTab("albums")}
                  className="text-xs font-bold text-[#0098EA] hover:text-blue-300 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {playlists.slice(0, 4).map((pl) => (
                  <PlaylistCard
                    key={pl.id}
                    playlist={pl}
                    onClick={() => navigate(`/playlist/${pl.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Artist About & Social Links Card */}
          <div className="bg-[#101A3B] p-6 rounded-2xl shadow-md space-y-4">
            <h3 className="text-base font-black uppercase tracking-wider text-white">About the Artist</h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {user.bio || "Certified recording artist and Web3 music creator releasing decentralized tracks and exclusive audio NFTs on TonJam."}
            </p>

            {/* Social Connects */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Social Channels:</span>
              <a
                href={`https://t.me/${user.username || 'tonjam'}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#0098EA]" /> Telegram
              </a>
              <a
                href={`https://x.com/${user.username || 'tonjam'}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Twitter className="w-3.5 h-3.5 text-blue-400" /> Twitter / X
              </a>
              <a
                href={`https://tonviewer.com/${user.walletAddress || ''}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> TON Explorer
              </a>
            </div>
          </div>

          {/* Owner Artist Entry Points (Only shown when verified artist is viewing own profile!) */}
          {isOwnProfile && (
            <div className="p-5 bg-gradient-to-r from-[#0052FF]/15 via-[#101A3B] to-[#0052FF]/10 rounded-2xl shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-[#0098EA]" /> Artist Studio Entry Point
                  </h4>
                  <p className="text-xs text-slate-400">Manage releases, review streaming telemetry and mint audio NFTs</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={() => navigate('/artist-dashboard')}
                  className="px-5 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-full font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  Launch Artist Dashboard
                </button>
                <button
                  onClick={() => navigate('/upload')}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Track
                </button>
                <button
                  onClick={() => navigate('/mint')}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5 text-[#0098EA]" /> Mint NFT
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TRACKS / DISCOGRAPHY TAB */}
      {activeTab === "tracks" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            All Tracks ({tracks.length})
          </h3>
          {tracks.length > 0 ? (
            <div className="space-y-2">
              {tracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:hidden">
                        {idx + 1}
                      </span>
                      <div className="w-6 hidden group-hover:flex items-center justify-center text-[#0098EA]">
                        {isCurrent && isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </div>
                      <img
                        src={track.coverUrl || (track as any).coverArt || getPlaceholderImage(`track-${track.id}`)}
                        alt={track.title}
                        className="w-11 h-11 rounded-xl object-cover bg-slate-900 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className={`text-sm font-bold truncate ${isCurrent ? "text-[#0098EA]" : "text-white"}`}>
                          {track.title}
                        </h4>
                        <span className="text-xs text-slate-400 truncate block">
                          {track.album || "Single Release"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {track.duration || "3:30"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#101A3B] p-12 rounded-2xl text-center space-y-2">
              <Disc className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">No tracks uploaded yet</p>
            </div>
          )}
        </div>
      )}

      {/* NFTS TAB */}
      {activeTab === "nfts" && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Minted NFT Catalog ({displayNFTs.length})
          </h3>
          {displayNFTs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayNFTs.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          ) : (
            <div className="bg-[#101A3B] p-12 rounded-2xl text-center space-y-2">
              <Gem className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">No music NFTs released yet</p>
            </div>
          )}
        </div>
      )}

      {/* ALBUMS & PLAYLISTS TAB */}
      {activeTab === "albums" && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Releases & Playlists ({playlists.length})
          </h3>
          {playlists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {playlists.map((pl) => (
                <PlaylistCard
                  key={pl.id}
                  playlist={pl}
                  onClick={() => navigate(`/playlist/${pl.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#101A3B] p-12 rounded-2xl text-center space-y-2">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">No albums or compilations created</p>
            </div>
          )}
        </div>
      )}

      {/* ABOUT TAB */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <div className="bg-[#101A3B] p-6 rounded-2xl shadow-md space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">Artist Biography</h4>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {user.bio || "Certified recording artist creating on the TON blockchain with TonJam."}
            </p>
            {user.walletAddress && (
              <div className="pt-2 flex items-center gap-2">
                <span className="text-xs text-slate-400">TON Payout Address:</span>
                <span className="text-xs font-mono text-[#0098EA]">{user.walletAddress}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistProfileContent;
