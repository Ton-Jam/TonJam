import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Gem, Library, Layers, Disc, Play, Pause, 
  Users, Copy, Twitter, Instagram, Send, Globe,
  Clock, Heart, Music, Flame, Sparkles, ChevronRight
} from "lucide-react";
import { UserProfile as UserProfileType, NFTItem, Track } from "@/types";
import { getPlaceholderImage } from "@/lib/utils";
import { ListenStreakIndicator } from "@/components/profile/ListenStreakIndicator";
import { BadgeSystem } from "@/components/BadgeSystem";
import { AchievementList } from "@/components/profile/AchievementList";
import NFTCard from "@/components/NFTCard";
import { SecureUserNFTDashboard } from "@/components/SecureUserNFTDashboard";
import PlaylistCard from "@/components/PlaylistCard";
import SocialFeed from "@/components/SocialFeed";

interface UserProfileContentProps {
  user: UserProfileType;
  isOwnProfile: boolean;
  activeTab: string;
  ownedNfts: NFTItem[];
  uploadedTracks?: Track[];
  userPlaylists: any[];
  userPosts: any[];
  artists?: any[];
  streakDays: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  setActiveTab: (tab: string) => void;
  onCopyWallet: () => void;
  copiedAddress: boolean;
  recentlyPlayed?: Track[];
  likedTracks?: Track[];
}

export const UserProfileContent: React.FC<UserProfileContentProps> = ({
  user,
  isOwnProfile,
  activeTab,
  ownedNfts,
  uploadedTracks = [],
  userPlaylists,
  userPosts,
  artists = [],
  streakDays,
  currentTrack,
  isPlaying,
  playTrack,
  setActiveTab,
  onCopyWallet,
  copiedAddress,
  recentlyPlayed = [],
  likedTracks = [],
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-8">
      {/* OVERVIEW TAB - Music-first layout */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          
          {/* 1. Recently Played Shelf (Music-First Spotify Paradigm) */}
          {recentlyPlayed.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0098EA]" />
                  Recently Played
                </h3>
                <button
                  onClick={() => setActiveTab("recent")}
                  className="text-xs font-bold text-[#0098EA] hover:text-blue-300 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  See All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Horizontal Scroll Track Carousel */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 select-none">
                {recentlyPlayed.slice(0, 6).map((track) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className="group bg-white/[0.04] hover:bg-white/[0.08] p-3 rounded-2xl shrink-0 w-36 sm:w-44 transition-all duration-200 cursor-pointer shadow-md"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-slate-900 shadow-md">
                        <img
                          src={track.coverUrl || (track as any).coverArt || getPlaceholderImage(`track-${track.id}`)}
                          alt={track.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                          isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <div className="w-9 h-9 rounded-full bg-[#0052FF] text-white flex items-center justify-center shadow-lg">
                            {isCurrent && isPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </div>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Playlists Shelf */}
          {userPlaylists.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <Library className="w-4 h-4 text-emerald-400" />
                  Curated Playlists
                </h3>
                <button
                  onClick={() => setActiveTab("playlists")}
                  className="text-xs font-bold text-[#0098EA] hover:text-blue-300 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  View All ({userPlaylists.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {userPlaylists.slice(0, 4).map((pl) => (
                  <PlaylistCard
                    key={pl.id}
                    playlist={pl}
                    onClick={() => navigate(`/playlist/${pl.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. My NFTs (Featured Collectibles) */}
          {ownedNfts.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <Gem className="w-4 h-4 text-purple-400" />
                  Music NFT Collectibles
                </h3>
                <button
                  onClick={() => setActiveTab("nfts")}
                  className="text-xs font-bold text-[#0098EA] hover:text-blue-300 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  View All ({ownedNfts.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {ownedNfts.slice(0, 3).map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            </div>
          )}

          {/* 4. Saved / Liked Tracks Shelf */}
          {likedTracks.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
                  Favorite Tracks
                </h3>
                <button
                  onClick={() => navigate("/favorite-tracks")}
                  className="text-xs font-bold text-[#0098EA] hover:text-blue-300 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  View All ({likedTracks.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {likedTracks.slice(0, 4).map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-center text-xs font-mono text-slate-500 group-hover:hidden">
                          {idx + 1}
                        </span>
                        <div className="w-5 hidden group-hover:flex items-center justify-center text-[#0098EA]">
                          {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </div>
                        <img
                          src={track.coverUrl || (track as any).coverArt || getPlaceholderImage(`track-${track.id}`)}
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-[#0098EA]' : 'text-white'}`}>
                            {track.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-400">
                        <span>{track.duration || '3:24'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Listening Activity & Streaks */}
          <div id="listen-streak-user" className="space-y-4">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Listening Activity
            </h3>
            <ListenStreakIndicator isOwnProfile={isOwnProfile} />
          </div>

          {/* 6. Badges & Achievements Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#101A3B] p-5 rounded-2xl shadow-md">
              <BadgeSystem user={user} isOwnProfile={isOwnProfile} />
            </div>
            <div className="bg-[#101A3B] p-5 rounded-2xl shadow-md">
              <AchievementList userId={user.uid} />
            </div>
          </div>
        </div>
      )}

      {/* RECENTLY PLAYED TAB */}
      {activeTab === "recent" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Listening History ({recentlyPlayed.length})
          </h3>
          {recentlyPlayed.length > 0 ? (
            <div className="space-y-2">
              {recentlyPlayed.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:hidden">
                        {idx + 1}
                      </span>
                      <div className="w-6 hidden group-hover:flex items-center justify-center text-[#0098EA]">
                        {isCurrent && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                      </div>
                      <img
                        src={track.coverUrl || (track as any).coverArt || getPlaceholderImage(`track-${track.id}`)}
                        alt={track.title}
                        className="w-11 h-11 rounded-lg object-cover bg-slate-900 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-[#0098EA]' : 'text-white'}`}>
                          {track.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {track.duration || '3:15'}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#101A3B] p-12 rounded-2xl text-center space-y-2">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">No recent playback signals</p>
              <p className="text-xs text-slate-500">Tracks listened to on TonJam will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* NFTS COLLECTION TAB */}
      {activeTab === "nfts" && (
        <div className="space-y-6">
          {isOwnProfile ? (
            <SecureUserNFTDashboard />
          ) : ownedNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ownedNfts.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          ) : (
            <div className="bg-[#101A3B] p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
              <Gem className="w-12 h-12 text-slate-600" />
              <h4 className="text-base font-bold text-white uppercase tracking-wider">
                No Digital Assets Yet
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                This collector hasn't acquired any music NFTs on TON yet.
              </p>
              <button
                onClick={() => navigate("/launchpad")}
                className="mt-2 px-6 py-2.5 bg-[#0052FF] hover:bg-[#1a66ff] text-white rounded-full font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                Explore Launchpad Drops
              </button>
            </div>
          )}
        </div>
      )}

      {/* PLAYLISTS TAB */}
      {activeTab === "playlists" && (
        <div className="space-y-6">
          {userPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {userPlaylists.map((pl) => (
                <PlaylistCard
                  key={pl.id}
                  playlist={pl}
                  onClick={() => navigate(`/playlist/${pl.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#101A3B] p-12 rounded-2xl text-center space-y-2">
              <Library className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">No playlists created yet</p>
            </div>
          )}
        </div>
      )}

      {/* ACTIVITY & FEED TAB */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          {userPosts.length > 0 ? (
            <SocialFeed posts={userPosts} />
          ) : (
            <div className="bg-[#101A3B] p-12 rounded-2xl text-center space-y-2">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">No posts shared yet</p>
            </div>
          )}
        </div>
      )}

      {/* ABOUT TAB */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <div className="bg-[#101A3B] p-6 rounded-2xl shadow-md space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">About User</h4>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {user.bio || "Active on-chain music listener and collector on TonJam ecosystem."}
            </p>
            {user.walletAddress && (
              <div className="pt-2 flex items-center gap-2">
                <span className="text-xs text-slate-400">TON Wallet:</span>
                <span className="text-xs font-mono text-[#0098EA]">{user.walletAddress}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#101A3B] p-5 rounded-2xl shadow-md">
              <BadgeSystem user={user} isOwnProfile={isOwnProfile} />
            </div>
            <div className="bg-[#101A3B] p-5 rounded-2xl shadow-md">
              <AchievementList userId={user.uid} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileContent;
