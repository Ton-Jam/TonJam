import * as React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, Pause, UserPlus, UserCheck, 
  Share2, MoreVertical, ArrowLeft, Disc,
  Globe, Send, QrCode
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useAuth } from "@/contexts/AuthContext";
import { getPlaceholderImage } from "@/lib/utils";
import { ArtistVerificationBadge } from "@/components/ArtistVerificationBadge";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";

// Custom Modals
import EditArtistProfileModal from "@/components/EditArtistProfileModal";
import { TipArtistModal } from "@/components/TipArtistModal";
import ArtistOptionsModal from "@/components/ArtistOptionsModal";
import { CollabRequestModal } from "./components/CollabRequestModal";
import { ArtistWalletQRModal } from "@/components/ArtistWalletQRModal";
import { ProfileQRCodeModal } from "@/components/profile/ProfileQRCodeModal";

// Hook
import { useArtistProfile } from "./hooks/useArtistProfile";
import { ProfileHeaderSkeleton, TrackListSkeleton } from "./components/Skeletons";

const formatFollowers = (count?: number): string => {
  if (!count || isNaN(count)) return "0 followers";
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M followers`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K followers`;
  }
  return `${count} followers`;
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
    setOptionsTrack
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
      const scrollThreshold = 200;
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
      <PageContainer animate={false} className="w-full bg-black min-h-screen text-white px-4 py-8 space-y-6 pb-28">
        <ProfileHeaderSkeleton />
        <TrackListSkeleton />
      </PageContainer>
    );
  }

  if (!artist) {
    return (
      <PageContainer animate={false} className="flex flex-col items-center justify-center p-20 text-center space-y-6 bg-black min-h-screen text-white">
        <h2 className="text-2xl font-bold tracking-tight">Artist Not Found</h2>
        <p className="text-zinc-400 text-xs">Verify your connection or try again.</p>
        <button 
          type="button"
          onClick={() => navigate("/discover")}
          className="px-6 py-2.5 bg-[#0052FF] text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#1a66ff] transition-colors cursor-pointer"
        >
          Discover Music
        </button>
      </PageContainer>
    );
  }

  const isOwnProfile = user?.uid === artist.uid;
  const popularTracks = showAllPopular ? tracks.slice(0, 10) : tracks.slice(0, 5);
  const artistHandle = artist.username ? `@${artist.username}` : `@${artist.name.toLowerCase().replace(/\s+/g, '')}`;

  const handleTrackOptions = (e: React.MouseEvent, track: any) => {
    e.stopPropagation();
    setOptionsTrack(track);
  };

  return (
    <PageContainer animate={true} hasPlayerSpacing={true} className="w-full bg-black min-h-screen text-white pb-32 font-sans">
      <PageHeader
        title="Artist Profile"
        showBack={true}
        rightContent={
          <button 
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: artist.name,
                  text: `Check out ${artist.name} on TonJam`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Profile link copied!");
              }
            }}
            className="p-2 rounded-full text-[#00B4D8] hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none outline-none"
            aria-label="Share Artist Profile"
            title="Share Artist Profile"
          >
            <Share2 className="w-5 h-5" />
          </button>
        }
      />

      {/* 2. CENTERED ARTIST HERO */}
      <div className="flex flex-col items-center text-center px-4 pt-2 pb-6 max-w-lg mx-auto">
        {/* [Artist Photo] */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-neutral-900 shadow-2xl mb-4 shrink-0">
          <LazyArtworkImage 
            src={artist.avatarUrl || artist.coverPhoto || getPlaceholderImage(`artist-${artist.uid}`)} 
            fallbackSrc={getPlaceholderImage(`artist-${artist.uid}`)}
            alt={artist.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Artist Name & Verified Check */}
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {artist.name}
          </h1>
          <ArtistVerificationBadge 
            isVerified={Boolean(artist.isVerifiedArtist)}
            artistName={artist.name}
            size="md"
          />
        </div>

        {/* @handle */}
        <p className="text-xs sm:text-sm text-zinc-400 mb-2">
          {artistHandle}
        </p>

        {/* Followers Count */}
        <p className="text-xs sm:text-sm font-medium text-zinc-300 mb-5">
          {formatFollowers(artist.followers || 12400)}
        </p>

        {/* [Follow] [Share] Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          {!isOwnProfile ? (
            <button 
              type="button"
              onClick={handleFollowToggle} 
              className={`px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                isFollowing 
                  ? "bg-[#242424] text-white hover:bg-[#2e2e2e]" 
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
              className="px-6 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95"
            >
              Edit Profile
            </button>
          )}

          <button 
            type="button"
            onClick={() => setShowQRModal(true)}
            className="px-6 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            aria-label="Share artist"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* SEPARATOR */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="h-px bg-white/[0.08] my-4" />
      </div>

      {/* 3. POPULAR SECTION */}
      <div className="max-w-2xl mx-auto px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Popular</h2>
          {tracks.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllPopular(!showAllPopular)}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {showAllPopular ? "Show less" : "See all"}
            </button>
          )}
        </div>

        {popularTracks.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4">No popular tracks available yet</p>
        ) : (
          <div className="divide-y-0 space-y-1">
            {popularTracks.map((track, index) => {
              const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
              const isThisTrack = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className="group flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
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
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                    {/* Index / Play Indicator */}
                    <div className="w-4 text-center text-xs text-zinc-400 flex items-center justify-center shrink-0">
                      {isCurrentPlaying ? (
                        <Pause className="w-3.5 h-3.5 text-[#00B4D8] fill-current" />
                      ) : isThisTrack ? (
                        <Play className="w-3.5 h-3.5 text-[#00B4D8] fill-current" />
                      ) : (
                        <span className="group-hover:hidden">{index + 1}</span>
                      )}
                      <Play className={`w-3.5 h-3.5 text-white fill-current hidden ${!isThisTrack ? "group-hover:block" : ""}`} />
                    </div>

                    {/* Artwork */}
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-[4px] overflow-hidden shrink-0 bg-neutral-900">
                      <LazyArtworkImage
                        src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)}
                        fallbackSrc={getPlaceholderImage(`track-${track.id}`)}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Title & Artist */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium leading-snug truncate ${isThisTrack ? "text-[#00B4D8]" : "text-white"}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {track.playCount ? `${track.playCount.toLocaleString()} plays` : track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Duration & Options */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-zinc-500 tabular-nums">
                      {formatDuration(track.duration)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleTrackOptions(e, track)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
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

      {/* SEPARATOR */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="h-px bg-white/[0.08] my-4" />
      </div>

      {/* 4. RELEASES SECTION (NFTs & Recent Music Releases) */}
      <div className="max-w-2xl mx-auto px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Releases</h2>
          {nfts.length > 3 && (
            <span className="text-xs text-zinc-400">{nfts.length} items</span>
          )}
        </div>

        {nfts.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4">No exclusive releases yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                onClick={() => navigate(`/nft/${nft.id}`)}
                className="group p-2.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] transition-colors cursor-pointer select-none"
              >
                <div className="relative aspect-square rounded-[4px] overflow-hidden bg-neutral-900 mb-2">
                  <LazyArtworkImage
                    src={nft.imageUrl || nft.coverUrl || getPlaceholderImage(`nft-${nft.id}`)}
                    fallbackSrc={getPlaceholderImage(`nft-${nft.id}`)}
                    alt={nft.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono font-medium text-[#00B4D8]">
                    NFT
                  </div>
                </div>
                <h3 className="text-xs font-semibold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                  {nft.title}
                </h3>
                <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                  <span className="truncate">{nft.edition || "1 of 50"}</span>
                  {nft.price && (
                    <span className="font-mono text-zinc-200 shrink-0 font-medium">
                      {nft.price}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEPARATOR */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="h-px bg-white/[0.08] my-4" />
      </div>

      {/* 5. ALBUMS / PLAYLISTS SECTION */}
      <div className="max-w-2xl mx-auto px-4 py-2 space-y-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Albums / Playlists</h2>

        {(albums.length === 0 && playlists.length === 0) ? (
          <p className="text-xs text-zinc-500 py-4">No albums or playlists created yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Albums */}
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => navigate(`/album/${album.id}`)}
                className="group p-2.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] transition-colors cursor-pointer select-none"
              >
                <div className="relative aspect-square rounded-[4px] overflow-hidden bg-neutral-900 mb-2">
                  <LazyArtworkImage
                    src={album.coverUrl || getPlaceholderImage(`album-${album.id}`)}
                    fallbackSrc={getPlaceholderImage(`album-${album.id}`)}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-medium text-zinc-300">
                    Album
                  </div>
                </div>
                <h3 className="text-xs font-semibold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                  {album.title}
                </h3>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {album.releaseYear || 'Album'} • {album.trackCount || 0} tracks
                </p>
              </div>
            ))}

            {/* Playlists */}
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="group p-2.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] transition-colors cursor-pointer select-none"
              >
                <div className="relative aspect-square rounded-[4px] overflow-hidden bg-neutral-900 mb-2">
                  <LazyArtworkImage
                    src={playlist.coverUrl || getPlaceholderImage(`playlist-${playlist.id}`)}
                    fallbackSrc={getPlaceholderImage(`playlist-${playlist.id}`)}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-medium text-zinc-300">
                    Playlist
                  </div>
                </div>
                <h3 className="text-xs font-semibold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                  {playlist.name}
                </h3>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  By {artist.name} • {playlist.trackCount || 0} tracks
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEPARATOR */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="h-px bg-white/[0.08] my-4" />
      </div>

      {/* 6. ABOUT SECTION */}
      <div className="max-w-2xl mx-auto px-4 py-2 space-y-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">About</h2>

        <div className="p-4 rounded-xl bg-[#141414] space-y-3.5">
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
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
                <span className="text-zinc-500 mr-1">•</span>
                <span>{artist.location}</span>
              </div>
            )}
            {artist.genre && (
              <div>
                <span className="text-zinc-500 mr-1">•</span>
                <span>{artist.genre}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          {artist.socials && (
            <div className="flex items-center gap-2 pt-2">
              {artist.socials.x && (
                <a
                  href={artist.socials.x}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
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
                  className="px-3 py-1.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
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
          avatar: artist.avatarUrl || artist.coverPhoto || getPlaceholderImage(`artist-${artist.uid}`),
          role: "Artist",
          bio: artist.bio,
          isVerified: Boolean(artist.isVerifiedArtist),
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
