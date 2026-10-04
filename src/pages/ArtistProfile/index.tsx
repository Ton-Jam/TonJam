import * as React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, Pause, Shuffle, UserPlus, UserCheck, 
  Share2, MoreVertical, Coins, MessageSquare,
  QrCode, Wallet, Globe, Send, Heart
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useAuth } from "@/contexts/AuthContext";
import { getPlaceholderImage } from "@/lib/utils";
import { ArtistVerificationBadge } from "@/components/ArtistVerificationBadge";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";
import ArtistNFTVolumeFloorChart from "@/components/artist/ArtistNFTVolumeFloorChart";

// Custom Modals
import EditArtistProfileModal from "@/components/EditArtistProfileModal";
import { TipArtistModal } from "@/components/TipArtistModal";
import ArtistOptionsModal from "@/components/ArtistOptionsModal";
import { CollabRequestModal } from "./components/CollabRequestModal";
import { ArtistWalletQRModal } from "@/components/ArtistWalletQRModal";
import { ProfileQRCodeModal } from "@/components/profile/ProfileQRCodeModal";

// Hook & Skeletons
import { useArtistProfile } from "./hooks/useArtistProfile";
import { ProfileHeaderSkeleton, TrackListSkeleton } from "./components/Skeletons";

const formatFollowers = (count?: number): string => {
  if (!count || isNaN(count)) return "0";
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return count.toLocaleString();
};

const formatDuration = (seconds?: number): string => {
  if (!seconds || isNaN(seconds)) return "3:20";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const ArtistProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    setHeaderTitle, 
    currentTrack, 
    isPlaying, 
    togglePlay,
    setOptionsTrack,
    likedTrackIds,
    toggleLikeTrack
  } = useAudio();

  // Hook details
  const {
    artist,
    isLoading,
    isFollowing,
    stats,
    tracks,
    nfts,
    albums,
    playlists,
    handleFollowToggle,
    handlePlayAll,
    handleShufflePlay,
    playTrack
  } = useArtistProfile();

  // Modals visibility states
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showTipModal, setShowTipModal] = React.useState(false);
  const [showArtistOptions, setShowArtistOptions] = React.useState(false);
  const [showCollabModal, setShowCollabModal] = React.useState(false);
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [showWalletQRModal, setShowWalletQRModal] = React.useState(false);
  const [showAllPopular, setShowAllPopular] = React.useState(false);

  // Set header title on scroll
  React.useEffect(() => {
    let currentTitle = "";
    const handleScroll = () => {
      const scrollThreshold = 180;
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

  if (isLoading) {
    return (
      <PageContainer animate={false} className="w-full bg-[#07111F] min-h-screen text-white px-4 py-8 space-y-6 pb-28">
        <ProfileHeaderSkeleton />
        <TrackListSkeleton />
      </PageContainer>
    );
  }

  if (!artist) {
    return (
      <PageContainer animate={false} className="flex flex-col items-center justify-center p-20 text-center space-y-6 bg-[#07111F] min-h-screen text-white">
        <h2 className="text-2xl font-bold tracking-tight">Artist Not Found</h2>
        <p className="text-zinc-400 text-xs">Verify your connection or explore another creator.</p>
        <button 
          type="button"
          onClick={() => navigate("/discover")}
          className="px-6 py-2.5 bg-[#0088CC] text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#0077b3] transition-colors cursor-pointer border-none shadow-lg shadow-[#0088CC]/20"
        >
          Discover Music
        </button>
      </PageContainer>
    );
  }

  const isOwnProfile = user?.uid === artist.uid;
  const popularTracks = showAllPopular ? tracks.slice(0, 10) : tracks.slice(0, 5);
  const artistHandle = artist.username ? `@${artist.username}` : `@${artist.name.toLowerCase().replace(/\s+/g, '')}`;
  const bannerImage = artist.coverPhoto || artist.avatarUrl || getPlaceholderImage(`artist-banner-${artist.uid}`);
  const avatarImage = artist.avatarUrl || artist.coverPhoto || getPlaceholderImage(`artist-${artist.uid}`);

  const isCurrentArtistPlaying = isPlaying && currentTrack && tracks.some((t) => t.id === currentTrack.id);

  const handlePrimaryPlayClick = () => {
    if (isCurrentArtistPlaying) {
      togglePlay();
    } else {
      handlePlayAll();
    }
  };

  const handleTrackOptions = (e: React.MouseEvent, track: any) => {
    e.stopPropagation();
    setOptionsTrack(track);
  };

  const handleTrackLike = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleLikeTrack(trackId);
  };

  return (
    <PageContainer animate={true} hasPlayerSpacing={true} className="w-full bg-[#07111F] min-h-screen text-white pb-32 font-sans selection:bg-[#0088CC]/30 select-none">
      <PageHeader
        title="Artist Profile"
        showBack={true}
        rightContent={
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={() => setShowQRModal(true)}
              className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none outline-none"
              aria-label="View QR Code"
              title="Artist QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: artist.name,
                    text: `Listen to ${artist.name} on TonJam`,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Profile link copied!");
                }
              }}
              className="p-2 rounded-full text-[#0088CC] hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none outline-none"
              aria-label="Share Artist Profile"
              title="Share Artist Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* 1. IMMERSIVE HERO WITH AMBIENT BACKDROP */}
      <div className="relative w-full overflow-hidden">
        {/* Ambient Blur Backdrop */}
        <div 
          className="absolute inset-0 h-64 sm:h-72 opacity-35 blur-3xl pointer-events-none scale-110 -z-10"
          style={{
            backgroundImage: `url(${bannerImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        />
        <div className="absolute inset-0 h-64 sm:h-72 bg-gradient-to-b from-transparent via-[#07111F]/70 to-[#07111F] -z-10 pointer-events-none" />

        {/* Hero Content */}
        <div className="flex flex-col items-center text-center px-4 pt-6 pb-6 max-w-xl mx-auto">
          {/* Avatar with Glow Shadow */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-neutral-900 shadow-2xl shadow-black/80 mb-3.5 shrink-0 ring-4 ring-[#0088CC]/20">
            <LazyArtworkImage 
              src={avatarImage} 
              fallbackSrc={getPlaceholderImage(`artist-${artist.uid}`)}
              alt={artist.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Artist Name & Verified Check */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {artist.name}
            </h1>
            <ArtistVerificationBadge 
              isVerified={Boolean(artist.isVerifiedArtist || artist.verified)}
              artistName={artist.name}
              size="md"
            />
          </div>

          {/* Clean Typography Metadata (Zero Pills) */}
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 mb-4 flex-wrap">
            <span className="font-medium text-zinc-300">{artistHandle}</span>
            {artist.genre && (
              <>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span>{artist.genre}</span>
              </>
            )}
            {artist.location && (
              <>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span>{artist.location}</span>
              </>
            )}
          </div>

          {/* Key Metrics Strip (Clean unboxed stats) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 w-full py-2.5 px-3 rounded-2xl bg-white/[0.04] backdrop-blur-md mb-5 text-center">
            <div>
              <p className="text-base sm:text-lg font-black text-white tabular-nums">
                {formatFollowers(stats?.monthlyListeners || 18400)}
              </p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">
                Listeners
              </p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-white tabular-nums">
                {formatFollowers(artist.followers || 12400)}
              </p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">
                Followers
              </p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-white tabular-nums">
                {tracks.length}
              </p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">
                Tracks
              </p>
            </div>
            <div className="hidden sm:block">
              <p className="text-base sm:text-lg font-black text-white tabular-nums">
                {nfts.length}
              </p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">
                NFT Drops
              </p>
            </div>
          </div>

          {/* Action Buttons Strip */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 w-full flex-wrap">
            {/* Play All Hero Action */}
            <button 
              type="button"
              onClick={handlePrimaryPlayClick}
              className="px-5 py-2.5 rounded-full bg-[#0088CC] hover:bg-[#0077b3] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-2 shadow-lg shadow-[#0088CC]/30 border-none"
              aria-label={isCurrentArtistPlaying ? "Pause audio" : "Play all tracks"}
            >
              {isCurrentArtistPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play All</span>
                </>
              )}
            </button>

            {/* Shuffle Play */}
            <button 
              type="button"
              onClick={handleShufflePlay}
              className="p-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center border-none"
              aria-label="Shuffle play"
              title="Shuffle All Tracks"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Follow / Edit Button */}
            {!isOwnProfile ? (
              <button 
                type="button"
                onClick={handleFollowToggle} 
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 border-none shadow-md ${
                  isFollowing 
                    ? "bg-white/[0.1] text-white hover:bg-white/[0.15]" 
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => setShowEditModal(true)}
                className="px-5 py-2.5 rounded-full bg-white/[0.1] hover:bg-white/[0.15] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 border-none"
              >
                Edit Profile
              </button>
            )}

            {/* Tip Artist in TON */}
            <button 
              type="button"
              onClick={() => setShowTipModal(true)}
              className="px-4 py-2.5 rounded-full bg-[#0088CC]/15 hover:bg-[#0088CC]/25 text-[#0088CC] text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 border-none"
              title="Tip Artist in TON"
            >
              <Coins className="w-4 h-4 text-[#0088CC]" />
              <span>Tip</span>
            </button>

            {/* Collab Request */}
            {!isOwnProfile && (
              <button 
                type="button"
                onClick={() => setShowCollabModal(true)}
                className="p-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center border-none"
                aria-label="Collab Request"
                title="Send Collaboration Request"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}

            {/* Wallet QR */}
            <button 
              type="button"
              onClick={() => setShowWalletQRModal(true)}
              className="p-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center border-none"
              aria-label="Artist Wallet QR"
              title="Artist Wallet QR"
            >
              <Wallet className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. POPULAR TRACKS SECTION */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Popular Tracks</h2>
            <span className="text-xs text-zinc-400 font-medium">({tracks.length})</span>
          </div>
          {tracks.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllPopular(!showAllPopular)}
              className="text-xs font-bold text-[#0088CC] hover:text-white transition-colors cursor-pointer border-none bg-transparent"
            >
              {showAllPopular ? "Show less" : "See all"}
            </button>
          )}
        </div>

        {popularTracks.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">No popular tracks uploaded yet.</p>
        ) : (
          <div className="space-y-1.5">
            {popularTracks.map((track, index) => {
              const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
              const isThisTrack = currentTrack?.id === track.id;
              const isLiked = likedTrackIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`group flex items-center justify-between py-2.5 px-3 rounded-xl transition-all cursor-pointer select-none ${
                    isThisTrack 
                      ? "bg-[#0088CC]/15" 
                      : "hover:bg-white/[0.06] active:bg-white/[0.08]"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      playTrack(track);
                    }
                  }}
                  aria-label={`Play ${track.title}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    {/* Index or Equalizer / Play icon */}
                    <div className="w-5 text-center text-xs text-zinc-400 flex items-center justify-center shrink-0">
                      {isCurrentPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3.5 w-3.5">
                          <span className="w-0.5 h-3 bg-[#0088CC] animate-pulse" />
                          <span className="w-0.5 h-2 bg-[#0088CC] animate-pulse delay-75" />
                          <span className="w-0.5 h-3.5 bg-[#0088CC] animate-pulse delay-150" />
                        </div>
                      ) : isThisTrack ? (
                        <Play className="w-3.5 h-3.5 text-[#0088CC] fill-current" />
                      ) : (
                        <span className="group-hover:hidden font-mono font-medium">{index + 1}</span>
                      )}
                      <Play className={`w-3.5 h-3.5 text-white fill-current hidden ${!isThisTrack ? "group-hover:block" : ""}`} />
                    </div>

                    {/* Artwork */}
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-neutral-900 shadow-md">
                      <LazyArtworkImage
                        src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)}
                        fallbackSrc={getPlaceholderImage(`track-${track.id}`)}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Title & Play Count */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold leading-snug truncate ${isThisTrack ? "text-[#0088CC]" : "text-white"}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {track.playCount ? `${track.playCount.toLocaleString()} plays` : (track.genre || artist.name)}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Duration */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleTrackLike(e, track.id)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer border-none bg-transparent ${
                        isLiked 
                          ? "text-rose-500" 
                          : "text-zinc-500 hover:text-white"
                      }`}
                      aria-label={isLiked ? "Unlike track" : "Like track"}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                    </button>

                    <span className="text-xs font-mono text-zinc-400 tabular-nums">
                      {formatDuration(track.duration)}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleTrackOptions(e, track)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
                      aria-label="Track options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. RELEASES & MUSIC NFTS SECTION */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Music NFTs & Releases</h2>
            <span className="text-xs text-zinc-400 font-medium">({nfts.length})</span>
          </div>
        </div>

        {nfts.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">No exclusive NFT drops available currently.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                onClick={() => navigate(`/nft/${nft.id}`)}
                className="group p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md transition-all cursor-pointer select-none active:scale-[0.98]"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-2.5 shadow-md">
                  <LazyArtworkImage
                    src={nft.imageUrl || nft.coverUrl || getPlaceholderImage(`nft-${nft.id}`)}
                    fallbackSrc={getPlaceholderImage(`nft-${nft.id}`)}
                    alt={nft.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-[#0088CC]">
                    NFT
                  </div>
                </div>
                <h3 className="text-xs font-bold text-white truncate group-hover:text-[#0088CC] transition-colors">
                  {nft.title}
                </h3>
                <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                  <span className="truncate">{nft.edition || "Limited"}</span>
                  {nft.price && (
                    <span className="font-mono text-zinc-200 shrink-0 font-bold">
                      {nft.price} TON
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Data visualization using Recharts for Volume and Floor Price History */}
        <ArtistNFTVolumeFloorChart 
          artistId={artist.uid}
          artistName={artist.name}
          nfts={nfts}
        />
      </div>

      {/* 4. ALBUMS / DISCOGRAPHY */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Discography & Playlists</h2>

        {(albums.length === 0 && playlists.length === 0) ? (
          <p className="text-xs text-zinc-500 py-6 text-center">No curated albums or playlists yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => navigate(`/album/${album.id}`)}
                className="group p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md transition-all cursor-pointer select-none active:scale-[0.98]"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-2.5 shadow-md">
                  <LazyArtworkImage
                    src={album.coverUrl || getPlaceholderImage(`album-${album.id}`)}
                    fallbackSrc={getPlaceholderImage(`album-${album.id}`)}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-zinc-200">
                    Album
                  </div>
                </div>
                <h3 className="text-xs font-bold text-white truncate group-hover:text-[#0088CC] transition-colors">
                  {album.title}
                </h3>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {album.releaseYear || 'Album'} · {album.trackCount || 0} tracks
                </p>
              </div>
            ))}

            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="group p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md transition-all cursor-pointer select-none active:scale-[0.98]"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-2.5 shadow-md">
                  <LazyArtworkImage
                    src={playlist.coverUrl || getPlaceholderImage(`playlist-${playlist.id}`)}
                    fallbackSrc={getPlaceholderImage(`playlist-${playlist.id}`)}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-zinc-200">
                    Playlist
                  </div>
                </div>
                <h3 className="text-xs font-bold text-white truncate group-hover:text-[#0088CC] transition-colors">
                  {playlist.name}
                </h3>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  By {artist.name} · {playlist.trackCount || 0} tracks
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. ABOUT ARTIST SECTION */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">About</h2>

        <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-md space-y-4">
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            {artist.bio || `${artist.name} is an active creator and recording artist on TonJam, minting exclusive music NFT releases and streaming live on TON blockchain.`}
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1 flex-wrap">
            {stats?.monthlyListeners && (
              <div>
                <span className="font-bold text-white mr-1">{stats.monthlyListeners.toLocaleString()}</span>
                <span>monthly listeners</span>
              </div>
            )}
            {artist.location && (
              <div>
                <span aria-hidden="true" className="text-zinc-600 mr-2">·</span>
                <span>{artist.location}</span>
              </div>
            )}
            {artist.genre && (
              <div>
                <span aria-hidden="true" className="text-zinc-600 mr-2">·</span>
                <span>{artist.genre}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          {artist.socials && (
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              {artist.socials.x && (
                <a
                  href={artist.socials.x}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5 border-none"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Twitter / X</span>
                </a>
              )}
              {artist.socials.telegram && (
                <a
                  href={artist.socials.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-full bg-[#0088CC]/20 hover:bg-[#0088CC]/30 text-xs text-[#0088CC] transition-colors flex items-center gap-1.5 border-none"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showArtistOptions && (
        <ArtistOptionsModal
          artist={artist}
          onClose={() => setShowArtistOptions(false)}
        />
      )}

      {showTipModal && (
        <TipArtistModal
          artist={artist}
          onClose={() => setShowTipModal(false)}
        />
      )}

      <ProfileQRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        profile={{
          name: artist.name,
          username: artist.username || artist.name.toLowerCase().replace(/\s+/g, ''),
          avatar: avatarImage,
          role: "Artist",
          bio: artist.bio,
          isVerified: Boolean(artist.isVerifiedArtist || artist.verified),
          uid: artist.uid
        }}
      />

      <ArtistWalletQRModal
        isOpen={showWalletQRModal}
        onClose={() => setShowWalletQRModal(false)}
        artist={artist}
      />

      {isOwnProfile && showEditModal && (
        <EditArtistProfileModal
          artist={artist}
          onClose={() => setShowEditModal(false)}
        />
      )}

      <CollabRequestModal
        isOpen={showCollabModal}
        onClose={() => setShowCollabModal(false)}
        targetArtist={artist}
      />

    </PageContainer>
  );
};

export default ArtistProfile;
