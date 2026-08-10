import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Shuffle, Heart, UserPlus, UserCheck, Zap, Gem, 
  Share2, MoreVertical, ExternalLink, ArrowLeft, Verified, 
  MapPin, Award, Send, MessageCircle, QrCode 
} from "lucide-react";
import { toast } from "sonner";
import { useAudio } from "@/contexts/AudioContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn, getPlaceholderImage } from "@/lib/utils";
import { ProfileQRCodeModal } from "@/components/profile/ProfileQRCodeModal";

// Custom Modals from existing codebase
import EditArtistProfileModal from "@/components/EditArtistProfileModal";
import TipArtistModal from "@/components/TipArtistModal";
import ArtistOptionsModal from "@/components/ArtistOptionsModal";
import { FanTokenHub } from "@/components/FanTokenHub";
import { FanPowerTracker } from "@/components/FanPowerTracker";
import { CollabRequestModal } from "./components/CollabRequestModal";

// Hook & Subsections
import { useArtistProfile } from "./hooks/useArtistProfile";
import { 
  ProfileHeaderSkeleton, 
  StatsRowSkeleton, 
  TrackListSkeleton, 
  CardGridSkeleton 
} from "./components/Skeletons";

import { OverviewTab } from "./sections/OverviewTab";
import { MusicTab } from "./sections/MusicTab";
import { AlbumsTab } from "./sections/AlbumsTab";
import { SinglesTab } from "./sections/SinglesTab";
import { NftsTab } from "./sections/NftsTab";
import { CollectionsTab } from "./sections/CollectionsTab";
import { PlaylistsTab } from "./sections/PlaylistsTab";
import { PostsTab } from "./sections/PostsTab";
import { EventsTab } from "./sections/EventsTab";
import { AboutTab } from "./sections/AboutTab";
import { SpecialFeaturesTab } from "./sections/SpecialFeaturesTab";
import { AnalyticsSection } from "./components/AnalyticsSection";

const ArtistProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setHeaderTitle } = useAudio();

  // Hook details
  const {
    artist,
    isLoading,
    isFollowing,
    activeTab,
    setActiveTab,
    stats,
    tracks,
    rawTracks,
    nfts,
    albums,
    singles,
    collections,
    playlists,
    posts,
    events,
    mutualFollowers,
    topSupporters,
    missions,
    analytics,
    trackSort,
    setTrackSort,
    supportAmount,
    setSupportAmount,
    isSupporting,
    handleFollowToggle,
    handlePlayAll,
    handleShufflePlay,
    handleSupportArtist,
    handleLikePost,
    playTrack
  } = useArtistProfile();

  // Modals visibility states
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showTipModal, setShowTipModal] = React.useState(false);
  const [showArtistOptions, setShowArtistOptions] = React.useState(false);
  const [showCollabModal, setShowCollabModal] = React.useState(false);
  const [showQRModal, setShowQRModal] = React.useState(false);

  // Set header title on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 250;
      if (window.scrollY > scrollThreshold) {
        setHeaderTitle(artist?.name || "");
      } else {
        setHeaderTitle("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      setHeaderTitle("");
    };
  }, [artist?.name, setHeaderTitle]);

  const handleShareProfile = () => {
    setShowQRModal(true);
  };

  const handlePlayAlbum = (albumId: string) => {
    if (rawTracks.length > 0) {
      playTrack(rawTracks[0]);
      toast.success("Playing album selection!");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-black min-h-screen text-white px-4 md:px-12 py-8 space-y-8 pb-28">
        <ProfileHeaderSkeleton />
        <StatsRowSkeleton />
        <TrackListSkeleton />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 bg-black min-h-screen text-white">
        <h2 className="text-2xl font-bold tracking-tight">Artist Profile Not Available</h2>
        <p className="text-muted-foreground text-xs">Verify your connection or try again.</p>
        <button 
          onClick={() => navigate("/discover")}
          className="px-6 py-2 bg-white text-black rounded-full font-bold text-xs"
        >
          Discover Music
        </button>
      </div>
    );
  }

  const isOwnProfile = user?.uid === artist.uid;

  const tabOptions = [
    { id: "overview", label: "Overview" },
    { id: "music", label: "Music" },
    { id: "albums", label: "Albums" },
    { id: "singles", label: "Singles" },
    { id: "nfts", label: "NFTs" },
    { id: "collections", label: "Collections" },
    { id: "playlists", label: "Playlists" },
    { id: "posts", label: "Posts" },
    { id: "events", label: "Events" },
    { id: "fan_tokens", label: "Fan Tokens" },
    { id: "fan_power", label: "Fan Power" },
    { id: "special", label: "TonJam Hub" },
    { id: "analytics", label: "Analytics" },
    { id: "about", label: "About" }
  ];

  return (
    <div className="w-full bg-black min-h-screen text-white pb-32">
      
      {/* 1. HERO PARALLAX BANNER */}
      <div className="relative w-full h-[150px] md:h-[190px] overflow-hidden">
        {/* Navigation Overlays */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-black/45 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-all cursor-pointer border-none flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowQRModal(true)}
              className="p-2.5 bg-black/45 hover:bg-black/70 backdrop-blur-md rounded-full text-blue-400 transition-all cursor-pointer border-none flex items-center justify-center"
              title="Share QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button 
              onClick={handleShareProfile}
              className="p-2.5 bg-black/45 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-all cursor-pointer border-none flex items-center justify-center"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {!isOwnProfile ? (
              <button 
                onClick={() => setShowArtistOptions(true)}
                className="p-2.5 bg-black/45 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-all cursor-pointer border-none flex items-center justify-center"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => setShowEditModal(true)}
                className="p-2.5 bg-black/45 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-all cursor-pointer border-none flex items-center justify-center"
              >
                <Gem className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cover Image */}
        <img 
          src={artist.coverPhoto || artist.bannerImageUrl || artist.bannerUrl || getPlaceholderImage(`banner-${artist.uid}`, 1600, 600)} 
          className="w-full h-full object-cover select-none" 
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10" />

        {/* Floating Avatar & Details */}
        <div className="absolute left-6 md:left-12 bottom-6 z-20 flex items-end gap-5">
          <div className="relative">
            <img 
              src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
              alt={artist.name} 
              className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-black object-cover bg-neutral-900" 
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-white">{artist.name}</h1>
              {artist.verified && (
                <Verified className="w-5 h-5 text-blue-500 fill-white shrink-0" />
              )}
            </div>
            <p className="text-xs text-neutral-400">@{artist.username?.replace("@", "") || "artist"}</p>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-semibold uppercase tracking-wider pt-0.5">
              <span>{artist.location || "Distributed Node"}</span>
              <span>•</span>
              <span className="text-cyan-400">{artist.genre || "Electronic"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Column Body */}
      <div className="px-4 md:px-12 mt-6 space-y-10">

        {/* 2. STATS ROW */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-4 bg-neutral-900/10 border border-neutral-900 rounded-[10px]">
            <div className="space-y-0.5">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest block">Monthly Listeners</span>
              <span className="text-sm font-black text-white font-mono">{stats.monthlyListeners.toLocaleString()}</span>
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest block">Followers</span>
              <span className="text-sm font-black text-white font-mono">{stats.followers.toLocaleString()}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest block">Decentralized Plays</span>
              <span className="text-sm font-black text-cyan-400 font-mono">{stats.streams.toLocaleString()}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest block">Total Mints</span>
              <span className="text-sm font-black text-white font-mono">{stats.nftCollectionsCount} Collections</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest block">Ledger Volume</span>
              <span className="text-sm font-black text-purple-400 font-mono">{stats.totalSales}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest block">Collectors</span>
              <span className="text-sm font-black text-white font-mono">{stats.nftOwnersCount} Wallets</span>
            </div>
          </div>
        )}

        {/* 3. QUICK ACTIONS GRID */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={handlePlayAll}
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 transition-colors rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none shadow-lg shadow-white/5"
          >
            <Play className="w-3.5 h-3.5 fill-current text-black" /> Play All
          </button>

          <button 
            onClick={handleShufflePlay}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white transition-colors rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-neutral-800"
          >
            <Shuffle className="w-3.5 h-3.5" /> Shuffle
          </button>

          {!isOwnProfile ? (
            <button 
              onClick={handleFollowToggle}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                isFollowing 
                  ? "bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300" 
                  : "bg-cyan-500 text-black hover:bg-cyan-400 border-none"
              )}
            >
              {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              {isFollowing ? "Following" : "Follow"}
            </button>
          ) : (
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-bold cursor-pointer border border-neutral-800"
            >
              Modify Ledger Profile
            </button>
          )}

          <button 
            onClick={() => setShowTipModal(true)}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-cyan-400 border border-cyan-500/25 transition-all rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-cyan-400 animate-pulse" /> Support Artist
          </button>

          {!isOwnProfile && (
            <button 
              onClick={() => setShowCollabModal(true)}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/25 transition-all rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Gem className="w-3.5 h-3.5" /> Request Collab
            </button>
          )}

          <button 
            onClick={() => navigate("/mint")}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-purple-400 border border-purple-500/25 transition-all rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Gem className="w-3.5 h-3.5" /> Mint Music NFT
          </button>
        </div>

        {/* 4. SPLIT GRID CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN PANEL: Profile mini statistics, mutual friends, community bio */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Expanded expandable story block */}
            <div className="bg-neutral-900/20 border border-neutral-900 rounded-[10px] p-5 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">Ledger Narrative</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {artist.bio || "No custom biography signed to the TON ledger yet. Support this artist to request updates!"}
              </p>
              
              <div className="pt-3 border-t border-neutral-900 space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-neutral-400">
                  <span>Record Label:</span>
                  <span className="text-white">TJ Independent Node</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-neutral-400">
                  <span>Contract Registry:</span>
                  <span className="text-white">TON Mainnet</span>
                </div>
              </div>
            </div>

            {/* Social / Mutual connections badge block */}
            {mutualFollowers.length > 0 && (
              <div className="bg-neutral-900/15 p-4 rounded-[10px] space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Mutual Listeners</h3>
                <div className="flex items-center -space-x-2">
                  {mutualFollowers.map((m) => (
                    <img 
                      key={m.id} 
                      src={m.avatarUrl} 
                      className="w-7 h-7 rounded-full border-2 border-black object-cover" 
                      alt="" 
                      title={m.name}
                    />
                  ))}
                  <span className="text-[10px] text-muted-foreground pl-3 font-semibold">
                    Followed by Julia & {mutualFollowers.length} others
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN PANEL: Content Tabs */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Scrollable Tabs Toolbar */}
            <div className="border-b border-neutral-900 overflow-x-auto no-scrollbar scroll-smooth">
              <div className="flex gap-6 pb-2 min-w-max">
                {tabOptions.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer bg-transparent",
                      activeTab === tab.id 
                        ? "text-white border-white" 
                        : "text-muted-foreground border-transparent hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Render selected content tab with state management */}
            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === "overview" && (
                    <OverviewTab 
                      tracks={tracks}
                      nfts={nfts}
                      albums={albums}
                      playlists={playlists}
                      posts={posts}
                      events={events}
                      onPlayTrack={playTrack}
                      onNavigateToTab={setActiveTab}
                    />
                  )}

                  {activeTab === "music" && (
                    <MusicTab 
                      tracks={tracks}
                      onPlayTrack={playTrack}
                      trackSort={trackSort}
                      onSortChange={setTrackSort}
                    />
                  )}

                  {activeTab === "albums" && (
                    <AlbumsTab 
                      albums={albums}
                      onPlayAlbum={handlePlayAlbum}
                    />
                  )}

                  {activeTab === "singles" && (
                    <SinglesTab 
                      singles={singles}
                      onPlayTrack={playTrack}
                    />
                  )}

                  {activeTab === "nfts" && (
                    <NftsTab nfts={nfts} />
                  )}

                  {activeTab === "collections" && (
                    <CollectionsTab collections={collections} />
                  )}

                  {activeTab === "playlists" && (
                    <PlaylistsTab playlists={playlists} />
                  )}

                  {activeTab === "posts" && (
                    <PostsTab posts={posts} onLikePost={handleLikePost} />
                  )}

                  {activeTab === "events" && (
                    <EventsTab events={events} />
                  )}

                  {activeTab === "fan_tokens" && (
                    <div className="p-1">
                      <FanTokenHub artist={artist} />
                    </div>
                  )}

                  {activeTab === "fan_power" && (
                    <div className="p-1">
                      <FanPowerTracker artist={artist} />
                    </div>
                  )}

                  {activeTab === "special" && (
                    <SpecialFeaturesTab 
                      artist={artist}
                      topSupporters={topSupporters}
                      missions={missions}
                      supportAmount={supportAmount}
                      onSupportAmountChange={setSupportAmount}
                      onSupportSubmit={handleSupportArtist}
                      isSupporting={isSupporting}
                    />
                  )}

                  {activeTab === "analytics" && analytics && (
                    <AnalyticsSection artist={artist} analytics={analytics} />
                  )}

                  {activeTab === "about" && (
                    <AboutTab artist={artist} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FLOATING MODALS COMPLIANCE */}
      <AnimatePresence>
        {showTipModal && (
          <TipArtistModal artist={artist} onClose={() => setShowTipModal(false)} />
        )}
        {showEditModal && (
          <EditArtistProfileModal artist={artist} onClose={() => setShowEditModal(false)} />
        )}
        {showArtistOptions && (
          <ArtistOptionsModal artist={artist} onClose={() => setShowArtistOptions(false)} />
        )}
        {showCollabModal && (
          <CollabRequestModal targetArtist={artist} isOpen={showCollabModal} onClose={() => setShowCollabModal(false)} />
        )}
      </AnimatePresence>

      <ProfileQRCodeModal 
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        profile={{
          name: artist.name,
          username: artist.username?.replace("@", "") || "artist",
          avatar: artist.avatarUrl,
          role: artist.genre ? `${artist.genre} Artist` : 'Artist',
          bio: artist.bio,
          isVerified: Boolean(artist.verified),
          uid: artist.uid
        }}
      />
    </div>
  );
};

export default ArtistProfile;
