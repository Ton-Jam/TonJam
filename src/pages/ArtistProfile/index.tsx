import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, Shuffle, Heart, UserPlus, UserCheck, Zap, Gem, 
  Share2, MoreHorizontal, ExternalLink, ArrowLeft, BadgeCheck, 
  MapPin, Award, Send, MessageCircle, QrCode, Disc, Layers, 
  Radio, Sparkles, Wallet, Globe, CheckCircle2, Trophy, Flame, Users, Music
} from "lucide-react";
import { toast } from "sonner";
import { useAudio } from "@/contexts/AudioContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn, getPlaceholderImage } from "@/lib/utils";
import { ProfileQRCodeModal } from "@/components/profile/ProfileQRCodeModal";
import { PageContainer } from "@/components/layout/PageContainer";

// Custom Modals
import EditArtistProfileModal from "@/components/EditArtistProfileModal";
import { TipArtistModal } from "@/components/TipArtistModal";
import ArtistOptionsModal from "@/components/ArtistOptionsModal";
import { CollabRequestModal } from "./components/CollabRequestModal";
import { ArtistWalletQRModal } from "@/components/ArtistWalletQRModal";
import { AutomatedArtistVerification } from "@/components/AutomatedArtistVerification";

// Hook & Subsections
import { useArtistProfile } from "./hooks/useArtistProfile";
import { 
  ProfileHeaderSkeleton, 
  StatsRowSkeleton, 
  TrackListSkeleton 
} from "./components/Skeletons";

import { OverviewTab } from "./sections/OverviewTab";
import { DiscographyTab } from "./sections/DiscographyTab";
import { WalletPayoutsTab } from "./sections/WalletPayoutsTab";
import { MusicTab } from "./sections/MusicTab";
import { AlbumsTab } from "./sections/AlbumsTab";
import { SinglesTab } from "./sections/SinglesTab";
import { NftsTab } from "./sections/NftsTab";
import { PlaylistsTab } from "./sections/PlaylistsTab";
import { PostsTab } from "./sections/PostsTab";
import { EventsTab } from "./sections/EventsTab";
import { AboutTab } from "./sections/AboutTab";
import { SpecialFeaturesTab } from "./sections/SpecialFeaturesTab";
import { AnalyticsSection } from "./components/AnalyticsSection";

const ArtistProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setHeaderTitle, currentTrack, isPlaying, togglePlay } = useAudio();

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
  const [showWalletQRModal, setShowWalletQRModal] = React.useState(false);

  // Set header title on scroll
  React.useEffect(() => {
    let currentTitle = "";
    const handleScroll = () => {
      const scrollThreshold = 320;
      const nextTitle = window.scrollY > scrollThreshold ? (artist?.name || "") : "";
      if (nextTitle !== currentTitle) {
        currentTitle = nextTitle;
        setHeaderTitle(nextTitle);
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

  // Check if currently playing a song by this artist
  const isPlayingCurrentArtist = React.useMemo(() => {
    if (!currentTrack || !artist || !isPlaying) return false;
    return currentTrack.artistId === artist.uid || 
           currentTrack.artist?.toLowerCase() === artist.name?.toLowerCase();
  }, [currentTrack, artist, isPlaying]);

  const handleMainPlayToggle = () => {
    if (isPlayingCurrentArtist) {
      togglePlay();
    } else {
      handlePlayAll();
    }
  };

  if (isLoading) {
    return (
      <PageContainer animate={false} className="w-full bg-[#050A24] min-h-screen text-white px-4 md:px-12 py-8 space-y-8 pb-28">
        <ProfileHeaderSkeleton />
        <StatsRowSkeleton />
        <TrackListSkeleton />
      </PageContainer>
    );
  }

  if (!artist) {
    return (
      <PageContainer animate={false} className="flex flex-col items-center justify-center p-20 text-center space-y-6 bg-[#050A24] min-h-screen text-white">
        <h2 className="text-2xl font-bold tracking-tight">Artist Profile Not Available</h2>
        <p className="text-slate-400 text-xs">Verify your connection or try again.</p>
        <button 
          onClick={() => navigate("/discover")}
          className="px-6 py-2.5 bg-[#0052FF] text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#1a66ff] transition-colors cursor-pointer shadow-lg"
        >
          Discover Music
        </button>
      </PageContainer>
    );
  }

  const isOwnProfile = user?.uid === artist.uid;

  const tabOptions = [
    { id: "overview", label: "Overview" },
    { id: "discography", label: "Discography" },
    { id: "music", label: "Tracks" },
    { id: "albums", label: "Albums" },
    { id: "singles", label: "Singles" },
    { id: "nfts", label: `NFTs (${nfts.length})` },
    { id: "payouts", label: "Royalties & Payouts" },
    { id: "playlists", label: "Playlists" },
    { id: "posts", label: "Community Feed" },
    { id: "events", label: "Events" },
    { id: "about", label: "About" },
    { id: "special", label: "TonJam Hub" },
    { id: "analytics", label: "Artist Analytics" }
  ];

  const headerImageUrl = artist.bannerUrl || artist.bannerImageUrl || artist.coverPhoto || artist.avatarUrl || getPlaceholderImage(`banner-${artist.uid}`, 1600, 600);

  return (
    <PageContainer animate={true} hasPlayerSpacing={true} className="w-full bg-[#050A24] min-h-screen text-white pb-36 font-sans">
      
      {/* 1. ARTIST SIGNATURE HERO HEADER */}
      <div className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] overflow-hidden flex flex-col justify-between">
        
        {/* Full-bleed photography background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 opacity-80"
          style={{ backgroundImage: `url(${headerImageUrl})` }}
        />
        
        {/* Gradient overlays matching Profile Hub palette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#050A24]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050A24] via-[#050A24]/85 to-transparent" />

        {/* Top Floating Navigation Bar */}
        <div className="relative z-30 px-4 sm:px-8 pt-6 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 bg-[#050A24]/80 hover:bg-[#050A24] backdrop-blur-md rounded-full text-white transition-all cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            {/* Quick Socials in Hero Top Bar */}
            {artist.socials?.x && (
              <a
                href={artist.socials.x}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-[#050A24]/80 hover:bg-[#050A24] backdrop-blur-md rounded-full text-slate-300 hover:text-white transition-all flex items-center justify-center hover:scale-105 shadow-md"
                title="X / Twitter"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}

            {artist.socials?.telegram && (
              <a
                href={artist.socials.telegram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-[#050A24]/80 hover:bg-[#050A24] backdrop-blur-md rounded-full text-slate-300 hover:text-[#0098EA] transition-all flex items-center justify-center hover:scale-105 shadow-md"
                title="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
            )}

            <button 
              onClick={() => setShowWalletQRModal(true)}
              className="p-2.5 bg-[#0098EA]/20 hover:bg-[#0098EA]/40 text-[#0098EA] backdrop-blur-md rounded-full transition-all cursor-pointer flex items-center justify-center shadow-md hover:scale-105"
              title="Artist Wallet QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button 
              onClick={handleShareProfile}
              className="p-2.5 bg-[#050A24]/80 hover:bg-[#050A24] backdrop-blur-md rounded-full text-white transition-all cursor-pointer flex items-center justify-center shadow-md hover:scale-105"
              title="Share Artist Card"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {!isOwnProfile ? (
              <button 
                onClick={() => setShowArtistOptions(true)}
                className="p-2.5 bg-[#050A24]/80 hover:bg-[#050A24] backdrop-blur-md rounded-full text-white transition-all cursor-pointer flex items-center justify-center shadow-md hover:scale-105"
                title="More Options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-105"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Hero Metadata: Verified Badge, Huge Artist Name, Monthly Listeners, Payout Wallet */}
        <div className="relative z-20 px-6 sm:px-10 md:px-12 pb-6 flex flex-col justify-end space-y-2">
          
          <div className="flex items-center gap-3 flex-wrap">
            <AutomatedArtistVerification 
              artist={artist} 
              size="md"
            />

            {artist.walletAddress && (
              <div 
                onClick={() => setActiveTab("payouts")}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-slate-200 text-xs font-mono font-medium cursor-pointer transition-colors"
                title="View on-chain payout status"
              >
                <Wallet className="w-3.5 h-3.5 text-[#0098EA]" />
                <span>{artist.walletAddress.slice(0, 6)}...{artist.walletAddress.slice(-4)}</span>
                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider ml-1">● Auto-Payout</span>
              </div>
            )}
          </div>

          {/* Huge Artist Name */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white drop-shadow-2xl">
            {artist.name}
          </h1>

          {/* Monthly Listeners Counter */}
          <div className="flex items-center gap-2 pt-1 text-sm sm:text-base font-medium text-slate-200 flex-wrap">
            <span>{(stats?.monthlyListeners || 184500).toLocaleString()} monthly on-chain listeners</span>
            {artist.genre && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{artist.genre}</span>
              </>
            )}
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{(artist.followers || 85400).toLocaleString()} followers</span>
          </div>
        </div>
      </div>

      {/* 2. ACTION CONTROLS BAR */}
      <div className="px-6 sm:px-10 md:px-12 py-4 flex items-center gap-4 sm:gap-6 flex-wrap">
        
        {/* Large Play Button */}
        <button 
          onClick={handleMainPlayToggle}
          className="w-14 h-14 bg-[#0088CC] hover:bg-[#0098EA] text-white shadow-[0_0_25px_rgba(0,136,204,0.5)] flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title={isPlayingCurrentArtist ? "Pause" : "Play"}
        >
          {isPlayingCurrentArtist ? (
            <Pause className="w-6 h-6 fill-current text-white" />
          ) : (
            <Play className="w-6 h-6 fill-current text-white ml-1" />
          )}
        </button>

        {/* Shuffle Play */}
        <button 
          onClick={handleShufflePlay}
          className="p-3 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/[0.06]"
          title="Shuffle Play"
        >
          <Shuffle className="w-6 h-6" />
        </button>

        {/* Follow / Following Pill */}
        {!isOwnProfile && (
          <button 
            onClick={handleFollowToggle} 
            className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
              isFollowing 
                ? "bg-white/10 text-white hover:bg-white/20" 
                : "bg-[#0052FF] text-white hover:bg-[#1a66ff] shadow-[0_4px_16px_rgba(0,82,255,0.4)]"
            }`}
          >
            {isFollowing ? "Following" : "Follow Artist"}
          </button>
        )}

        {/* Action Pills */}
        {!isOwnProfile ? (
          <>
            <button 
              onClick={() => setShowTipModal(true)}
              className="px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Zap className="w-3.5 h-3.5 fill-current" /> Tip TON
            </button>

            <button 
              onClick={() => setShowWalletQRModal(true)}
              className="px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-[#0098EA]/15 hover:bg-[#0098EA]/25 text-[#0098EA] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
              title="Generate TON Wallet Tip QR Code"
            >
              <QrCode className="w-3.5 h-3.5" /> Tip QR
            </button>

            <button 
              onClick={() => setShowCollabModal(true)}
              className="px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-white/[0.08] hover:bg-white/[0.15] text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Gem className="w-3.5 h-3.5 text-cyan-300" /> Collab
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setShowWalletQRModal(true)}
              className="px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-[#0098EA]/15 hover:bg-[#0098EA]/25 text-[#0098EA] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
              title="Generate My TON Wallet Tip QR Code"
            >
              <QrCode className="w-3.5 h-3.5" /> My Wallet QR
            </button>

            <button 
              onClick={() => navigate("/mint")}
              className="px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" /> Mint Music NFT
            </button>
          </>
        )}
      </div>

      {/* 3. PROFILE STATS ROW (Matching Profile Hub) */}
      <div className="px-6 sm:px-10 md:px-12 py-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#101A3B] rounded-[12px] p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-slate-400">
                Monthly Listeners
              </span>
              <div className="shrink-0 p-1 rounded-md bg-white/5">
                <Music className="w-4 h-4 text-[#0098EA]" />
              </div>
            </div>
            <div className="mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white">
                {(stats?.monthlyListeners || 184500).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-[#101A3B] rounded-[12px] p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-slate-400">
                Total Streams
              </span>
              <div className="shrink-0 p-1 rounded-md bg-white/5">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <div className="mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white">
                {(stats?.streams || 520000).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-[#101A3B] rounded-[12px] p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-slate-400">
                NFT Music Drops
              </span>
              <div className="shrink-0 p-1 rounded-md bg-white/5">
                <Gem className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div className="mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white">
                {nfts.length}
              </span>
            </div>
          </div>

          <div className="bg-[#101A3B] rounded-[12px] p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-slate-400">
                Fan Power & TJ
              </span>
              <div className="shrink-0 p-1 rounded-md bg-white/5">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="mt-1">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-amber-300">
                9,450 XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABS NAVIGATION (Matching Profile Hub) */}
      <div className="px-6 sm:px-10 md:px-12 mt-4 mb-6 overflow-x-auto no-scrollbar">
        <div className="w-full flex gap-1.5 overflow-x-auto no-scrollbar py-2 px-1 select-none scroll-smooth">
          {tabOptions.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-200 focus:outline-none cursor-pointer whitespace-nowrap shrink-0 z-10"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeArtistTabPill"
                    className="absolute inset-0 bg-[#0088CC] shadow-[0_0_15px_rgba(0,136,204,0.4)] rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className={isActive ? "text-white font-black" : "text-slate-400 hover:text-slate-200"}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. TAB CONTENT RENDERER */}
      <div className="px-6 sm:px-10 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "overview" && (
              <OverviewTab 
                artist={artist}
                tracks={tracks}
                nfts={nfts}
                albums={albums}
                playlists={playlists}
                posts={posts}
                events={events}
                onPlayTrack={playTrack}
                onNavigateToTab={(tab: string) => setActiveTab(tab)}
              />
            )}

            {activeTab === "discography" && (
              <DiscographyTab 
                artist={artist}
                albums={albums}
                singles={singles}
                tracks={tracks}
                nfts={nfts}
                onPlayTrack={playTrack}
                onPlayAlbum={handlePlayAlbum}
              />
            )}

            {activeTab === "payouts" && (
              <WalletPayoutsTab 
                artist={artist}
              />
            )}

            {activeTab === "music" && (
              <MusicTab 
                tracks={tracks}
                trackSort={trackSort}
                onSortChange={(sort) => setTrackSort(sort)}
                onPlayTrack={playTrack}
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
              <NftsTab 
                nfts={nfts}
              />
            )}

            {activeTab === "playlists" && (
              <PlaylistsTab 
                playlists={playlists}
              />
            )}

            {activeTab === "posts" && (
              <PostsTab 
                posts={posts}
                onLikePost={handleLikePost}
              />
            )}

            {activeTab === "events" && (
              <EventsTab 
                events={events}
              />
            )}

            {activeTab === "about" && (
              <AboutTab 
                artist={artist}
              />
            )}

            {activeTab === "special" && (
              <SpecialFeaturesTab 
                artist={artist}
                supportAmount={supportAmount}
                onSupportAmountChange={setSupportAmount}
                onSupportSubmit={handleSupportArtist}
                isSupporting={isSupporting}
                topSupporters={topSupporters}
                missions={missions}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsSection 
                artist={artist}
                analytics={analytics}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 6. MODALS */}
      {showEditModal && (
        <EditArtistProfileModal
          artist={artist}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showTipModal && (
        <TipArtistModal
          artist={artist}
          onClose={() => setShowTipModal(false)}
        />
      )}

      {showArtistOptions && (
        <ArtistOptionsModal
          artist={artist}
          onClose={() => setShowArtistOptions(false)}
        />
      )}

      <CollabRequestModal
        isOpen={showCollabModal}
        onClose={() => setShowCollabModal(false)}
        targetArtist={artist}
      />

      <ProfileQRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        profile={{
          name: artist.name,
          username: artist.username || artist.name.toLowerCase().replace(/\s+/g, ""),
          avatar: artist.avatarUrl,
          role: "Verified Artist",
          bio: artist.bio,
          isVerified: true,
          uid: artist.uid
        }}
      />

      <ArtistWalletQRModal
        isOpen={showWalletQRModal}
        onClose={() => setShowWalletQRModal(false)}
        artist={artist}
      />
    </PageContainer>
  );
};

export default ArtistProfile;
