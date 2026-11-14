import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "@/contexts/AudioContext";
import { useNFT } from "@/contexts/NFTContext";
import { useTask } from "@/contexts/TaskContext";
import { collection, limit, onSnapshot, query } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { getPlaceholderImage } from "@/lib/utils";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { TrackCard, NFTCard, PlaylistCard } from "@/components/music";

import ContinueListeningCard from "./ContinueListeningCard";
import NFTCollectionCard from "./NFTCollectionCard";
import SponsoredFeedCard from "./SponsoredFeedCard";
import LiveSpaceCard from "./LiveSpaceCard";
import RewardPreviewCard from "./RewardPreviewCard";
import MarketplaceCard from "./MarketplaceCard";
import TopicPill from "./TopicPill";
import CommunityFeedCard from "./CommunityFeedCard";
import LatestMarketActivity from "./LatestMarketActivity";
import TrendingTracks from "./TrendingTracks";
import RecentlyMintedNFTs from "./RecentlyMintedNFTs";

interface LiveSpaceItem {
  id: string;
  title: string;
  host: string;
  listeners: string;
}

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    playTrack,
    userProfile,
    allTracks,
    allNFTs,
    playlists,
    collections,
    artists,
    posts,
    recentlyPlayed,
    followedUserIds,
    toggleFollowUser,
  } = useAudio();
  const { nfts } = useNFT();
  const { tasks } = useTask();

  const genres = ["All", "Afrobeats", "Hip-Hop", "Electronic", "R&B", "Pop", "Amapiano", "Reggae", "Dancehall"];
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [sponsoredPromos, setSponsoredPromos] = useState<any[]>([]);
  const [liveSpaces, setLiveSpaces] = useState<LiveSpaceItem[]>([]);
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    const promoQ = query(collection(db, "sponsoredContent"), limit(10));
    const unsubPromos = onSnapshot(
      promoQ,
      (snap) => {
        const now = new Date().toISOString();
        const active: any[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          const approved = data.status === "approved" || data.active === true;
          const afterStart = !data.startDate || data.startDate <= now;
          const beforeEnd = !data.endDate || data.endDate >= now;
          if (approved && afterStart && beforeEnd) {
            active.push({ id: docSnap.id, ...data });
          }
        });
        setSponsoredPromos(active);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "sponsoredContent")
    );

    const spacesQ = query(collection(db, "liveStreams"), limit(5));
    const unsubSpaces = onSnapshot(
      spacesQ,
      (snap) => {
        const rows: LiveSpaceItem[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as any;
          if (d.status === "live" || d.isLive) {
            rows.push({
              id: docSnap.id,
              title: d.title || "Live Audio Room",
              host: d.hostName || d.artistName || "Artist",
              listeners: String(d.viewersCount ?? d.listeners ?? 0),
            });
          }
        });
        setLiveSpaces(rows);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "liveStreams")
    );

    return () => {
      unsubPromos();
      unsubSpaces();
    };
  }, []);

  useEffect(() => {
    if (sponsoredPromos.length <= 1) return;
    const timer = setInterval(() => {
      setPromoIndex((p) => (p + 1) % sponsoredPromos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sponsoredPromos.length]);

  const activeTrackForResume = recentlyPlayed[0] || allTracks[0] || null;

  const newDrops = useMemo(() => {
    const filtered = selectedGenre === "All"
      ? allTracks
      : allTracks.filter((t) => (t.genre || "").toLowerCase().includes(selectedGenre.toLowerCase()));
    return [...filtered]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 12);
  }, [allTracks, selectedGenre]);

  const nftCatalog = allNFTs.length > 0 ? allNFTs : nfts;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;

  const toggleFollow = (artId: string) => {
    toggleFollowUser?.(artId);
    if (!followedUserIds.includes(artId)) {
      confetti({ particleCount: 12, spread: 20 });
    }
  };

  return (
    <div className="space-y-8 select-none">
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-1.5 leading-none pt-2">
            Good Evening 👋
          </h1>
          <p className="text-base font-extrabold text-[#9AA0AE]">
            Welcome Back, {userProfile?.username || userProfile?.name || "Listener"}
          </p>
          <p className="text-xs text-[#9AA0AE]/80">
            Discover new sounds, collect music NFTs and earn rewards.
          </p>
        </div>

        {activeTrackForResume && (
          <ContinueListeningCard
            title={activeTrackForResume.title}
            artist={activeTrackForResume.artist}
            coverUrl={activeTrackForResume.coverUrl || getPlaceholderImage(`track-${activeTrackForResume.id}`)}
            onPlay={() => playTrack(activeTrackForResume)}
          />
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {genres.map((genre) => (
          <TopicPill
            key={genre}
            label={genre}
            isActive={selectedGenre === genre}
            onClick={() => setSelectedGenre(genre)}
          />
        ))}
      </div>

      <RewardPreviewCard
        completedTasks={completedTasks}
        totalTasks={tasks.length || 5}
        balance={userProfile?.tjBalance || 0}
        onViewTasks={() => navigate("/tasks")}
      />

      {sponsoredPromos.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-black text-white">Featured Launches & Updates</h2>
          <div className="relative h-[170px] overflow-hidden rounded-2xl bg-[#0A113A]/50">
            <AnimatePresence mode="wait">
              {sponsoredPromos.map((promo, idx) => (
                idx === promoIndex && (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <SponsoredFeedCard
                      title={promo.title}
                      description={promo.description}
                      artwork={promo.imageUrl || getPlaceholderImage(`promo-${promo.id}`)}
                      badge="SPONSORED"
                      ctaText="View Release"
                      onClick={() => navigate(promo.link || "/marketplace")}
                    />
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <LatestMarketActivity />

      {collections.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Trending NFT Collections</h2>
            <button
              onClick={() => navigate("/collections")}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-end px-2 text-xs font-bold text-[#0098EA] border-none bg-transparent cursor-pointer"
              aria-label="View all trending NFT collections"
            >
              All <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {collections.map((col) => (
              <NFTCollectionCard
                key={col.id}
                id={String(col.id)}
                name={col.name}
                artist={(col as any).creator || "Creator"}
                coverUrl={col.coverUrl || getPlaceholderImage(`col-${col.id}`)}
                floorPrice={String((col as any).floorPrice || "0")}
                mintedCount={col.nftIds?.length || 0}
                totalLimit={(col as any).totalSupply || col.nftIds?.length || 0}
              />
            ))}
          </div>
        </div>
      )}

      {newDrops.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">New Drops</h2>
            <button
              onClick={() => navigate("/search")}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-end px-2 text-xs font-bold text-[#00B4D8] border-none bg-transparent cursor-pointer"
              aria-label="View all new drops"
            >
              All <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {newDrops.map((track) => (
              <div key={track.id} className="w-[170px] sm:w-[190px] shrink-0 snap-start">
                <TrackCard
                  track={track}
                  variant="expanded"
                  showVerifiedBadge={true}
                  showDuration={true}
                  showGenre={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {playlists.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Featured Playlists</h2>
            <button
              onClick={() => navigate("/library")}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-end px-2 text-xs font-bold text-[#00B4D8] border-none bg-transparent cursor-pointer"
              aria-label="View all playlists"
            >
              All <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {playlists.map((playlist, idx) => (
              <div key={playlist.id} className="w-[180px] sm:w-[200px] shrink-0 snap-start">
                <PlaylistCard
                  playlist={playlist}
                  artworkStyle={idx % 2 === 0 ? "single" : "collage"}
                  showStatusIndicator={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <TrendingTracks />

      {artists.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-black text-white">Trending Artists</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {artists.slice(0, 8).map((art) => {
              const hasFollowed = followedUserIds.includes(art.uid);
              return (
                <div
                  key={art.uid}
                  onClick={() => navigate(`/artist/${art.uid}`)}
                  className="w-[125px] shrink-0 rounded-2xl bg-[#0A113A]/50 p-3.5 flex flex-col items-center justify-between space-y-3 text-center cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-[#050A24] flex items-center justify-center overflow-hidden">
                    <img
                      src={art.avatarUrl || getPlaceholderImage(`artist-${art.uid}`)}
                      alt={art.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-black text-white truncate max-w-[90px]">{art.name}</h4>
                      {(art.verified || art.isVerifiedArtist) && <CheckCircle className="w-3 h-3 text-blue-400 fill-current" />}
                    </div>
                    <span className="text-[9px] text-[#9AA0AE]">{(art.followers || 0).toLocaleString()} fans</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollow(art.uid);
                    }}
                    className={`w-full min-h-[44px] text-[9px] font-black uppercase tracking-widest rounded-xl border-none cursor-pointer flex items-center justify-center transition-all active:scale-95 ${
                      hasFollowed ? "bg-white/5 text-[#9AA0AE]" : "bg-[#5B6BFF] text-white"
                    }`}
                  >
                    {hasFollowed ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {liveSpaces.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-black text-white">Live Spaces</h2>
          <div className="space-y-2.5">
            {liveSpaces.map((space) => (
              <LiveSpaceCard
                key={space.id}
                title={space.title}
                host={space.host}
                listeners={space.listeners}
                onJoin={() => navigate("/jamspace")}
              />
            ))}
          </div>
        </div>
      )}

      {nftCatalog.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Top Marketplace Picks</h2>
            <button
              onClick={() => navigate("/marketplace")}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-end px-2 text-xs font-bold text-[#00B4D8] border-none bg-transparent cursor-pointer"
              aria-label="View all marketplace picks"
            >
              All <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {nftCatalog.slice(0, 6).map((pick) => (
              <div key={pick.id} className="w-[175px] sm:w-[195px] shrink-0 snap-start">
                <NFTCard
                  nft={pick}
                  variant={pick.listingType === "auction" ? "auction" : "sale"}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <RecentlyMintedNFTs title="Recently Added" />

      {posts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-black text-white">Community Activity</h2>
          <div className="rounded-2xl bg-[#0A113A]/50 p-4 space-y-3.5">
            {posts.slice(0, 5).map((post) => (
              <CommunityFeedCard
                key={post.id}
                username={post.userName || "Creator"}
                action="shared a post"
                target={post.content?.slice(0, 60) || "JamSpace Update"}
                time={post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recent"}
                avatar={post.userAvatar || getPlaceholderImage(`user-${post.userId}`)}
                accentColor="#5B6BFF"
              />
            ))}
            <Button
              size="sm"
              onClick={() => navigate("/jamspace")}
              className="w-full min-h-[44px] text-[10px] font-black bg-white/[0.04] hover:bg-white/[0.08] text-[#9AA0AE] hover:text-white border-none flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            >
              Explore All Community Activity
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
export {
  ContinueListeningCard,
  NFTCollectionCard,
  SponsoredFeedCard,
  LiveSpaceCard,
  RewardPreviewCard,
  MarketplaceCard,
  TopicPill,
  CommunityFeedCard,
  RecentlyMintedNFTs,
};
