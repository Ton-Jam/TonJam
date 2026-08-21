import * as React from "react";
import { Track, NFTItem, Artist } from "@/types";
import { AlbumData, ArtistEvent, ArtistPost, PlaylistData } from "../types";
import { 
  Play, Pause, Heart, Sparkles, Gem, ArrowRight, 
  Disc, Users, MapPin, ExternalLink, Calendar, Plus, Check,
  Wallet, Zap, CheckCircle2, Sliders, Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MOCK_ARTISTS } from "@/constants";
import { useAudio } from "@/contexts/AudioContext";
import { toast } from "sonner";

interface OverviewTabProps {
  artist?: Artist;
  tracks: Track[];
  nfts: NFTItem[];
  albums: AlbumData[];
  playlists: PlaylistData[];
  posts: ArtistPost[];
  events: ArtistEvent[];
  onPlayTrack: (track: Track) => void;
  onNavigateToTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  artist,
  tracks,
  nfts,
  albums,
  playlists,
  posts,
  events,
  onPlayTrack,
  onNavigateToTab
}) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, togglePlay } = useAudio();
  const [showAllPopular, setShowAllPopular] = React.useState(false);
  const [discographyFilter, setDiscographyFilter] = React.useState<"popular" | "albums" | "singles">("popular");
  const [likedTracks, setLikedTracks] = React.useState<Record<string, boolean>>({});

  const toggleLike = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTracks(prev => {
      const next = !prev[trackId];
      toast(next ? "Added to Liked Songs" : "Removed from Liked Songs");
      return { ...prev, [trackId]: next };
    });
  };

  const popularTracks = showAllPopular ? tracks.slice(0, 10) : tracks.slice(0, 5);
  const latestRelease = tracks[0] || albums[0];
  const upcomingEvent = events[0];

  // Similar artists for "Fans Also Like"
  const similarArtists = React.useMemo(() => {
    return MOCK_ARTISTS.filter(a => a.uid !== artist?.uid).slice(0, 5);
  }, [artist?.uid]);

  const activeWallet = artist?.walletAddress || "UQCc_DJ_Krupy_Vibez_x9y1_8888";

  return (
    <div className="space-y-10 animate-in fade-in" id="tonjam-overview-tab">
      
      {/* 0. TON ROYALTY & AUTOMATIC PAYOUT BANNER (Dark Glass, No Border Lines) */}
      <div 
        onClick={() => onNavigateToTab("payouts")}
        className="bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl group"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-3.5 rounded-2xl bg-[#0098EA]/10 text-[#0098EA] shrink-0 group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Automatic TON Payouts & Royalty Protocol
              </h3>
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Live
              </span>
            </div>
            <p className="text-xs text-neutral-400 truncate">
              Payout Recipient: <span className="font-mono text-neutral-300">{activeWallet}</span> • Auto-settles per stream & NFT sale
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-white font-mono block">
              {(artist?.earnings?.total || 1764.5).toFixed(1)} TON Paid
            </span>
            <span className="text-[10px] text-neutral-400">View Royalty Splits & Ledger</span>
          </div>
          <div className="px-4 py-2 bg-white/[0.06] group-hover:bg-white/[0.12] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5">
            <span>Manage Payouts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 1. POPULAR TRACKS & ARTIST PICK GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* POPULAR TRACKS */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Popular Tracks</h2>
          </div>

          <div className="space-y-1">
            {popularTracks.map((track, index) => {
              const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
              const isThisTrack = currentTrack?.id === track.id;
              const isLiked = likedTracks[track.id];

              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer ${
                    isThisTrack ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Left: Index / Play button, Artwork, Title */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-5 text-center text-xs font-semibold text-neutral-400 flex items-center justify-center shrink-0">
                      {isCurrentPlaying ? (
                        <div className="w-3.5 h-3.5 flex items-center justify-center">
                          <span className="w-1 h-3 bg-[#1DB954] animate-pulse rounded-full mr-0.5" />
                          <span className="w-1 h-4 bg-[#1DB954] animate-pulse rounded-full delay-75 mr-0.5" />
                          <span className="w-1 h-2 bg-[#1DB954] animate-pulse rounded-full delay-150" />
                        </div>
                      ) : (
                        <>
                          <span className={`group-hover:hidden ${isThisTrack ? "text-[#1DB954]" : ""}`}>
                            {index + 1}
                          </span>
                          <Play className="w-3.5 h-3.5 fill-current text-white hidden group-hover:block ml-0.5" />
                        </>
                      )}
                    </div>

                    <img
                      src={track.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"}
                      className="w-11 h-11 object-cover rounded-xl shrink-0 shadow-md"
                      alt={track.title}
                    />

                    <div className="min-w-0 pr-2 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs sm:text-sm font-semibold truncate transition-colors ${
                          isThisTrack ? "text-[#1DB954]" : "text-white group-hover:text-[#1DB954]"
                        }`}>
                          {track.title}
                        </h4>
                        {track.isNFT && (
                          <span className="bg-purple-500/20 text-purple-300 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                            NFT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate">{track.genre || "Electronic Master"}</p>
                    </div>
                  </div>

                  {/* Middle: Stream count */}
                  <div className="hidden sm:block text-right px-4">
                    <span className="text-xs font-mono text-neutral-400">
                      {(track.playCount || track.streams || 124500 + index * 34200).toLocaleString()} streams
                    </span>
                  </div>

                  {/* Right: Heart toggle & Duration */}
                  <div className="flex items-center gap-4 shrink-0">
                    <button
                      onClick={(e) => toggleLike(track.id, e)}
                      className={`p-1 transition-colors cursor-pointer ${
                        isLiked 
                          ? "text-[#1DB954]" 
                          : "text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-white"
                      }`}
                      title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                    </button>

                    <span className="text-xs text-neutral-400 font-mono w-10 text-right">
                      {Math.floor((track.duration || 215) / 60)}:{(String((track.duration || 215) % 60)).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {tracks.length > 5 && (
            <button
              onClick={() => setShowAllPopular(prev => !prev)}
              className="mt-2 text-xs font-extrabold tracking-wider uppercase text-neutral-400 hover:text-white transition-colors cursor-pointer py-2 px-1"
            >
              {showAllPopular ? "Show less" : "See more tracks"}
            </button>
          )}
        </div>

        {/* ARTIST PICK */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Artist Pick</h2>
          
          <div className="bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md transition-all rounded-3xl p-5 space-y-4 cursor-pointer group shadow-xl">
            <div className="flex items-center gap-2.5">
              <img
                src={artist?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
                alt=""
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-xs text-neutral-400 font-medium">
                Pinned by <strong className="text-white font-semibold">{artist?.name || "Artist"}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <img
                src={tracks[0]?.coverUrl || albums[0]?.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop"}
                className="w-20 h-20 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform"
                alt="Artist Pick"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#1DB954] bg-[#1DB954]/10 px-2 py-0.5 rounded-full inline-block">
                  Latest Master
                </span>
                <h4 className="text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                  {tracks[0]?.title || "Solar Pulse Genesis"}
                </h4>
                <p className="text-xs text-neutral-400">Single • 2026</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Web3 Audio Stems</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (tracks[0]) onPlayTrack(tracks[0]);
                }}
                className="w-10 h-10 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DISCOGRAPHY PREVIEW */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Discography</h2>
            <button
              onClick={() => onNavigateToTab("discography")}
              className="text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <span>See Full Discography</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* Segmented Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setDiscographyFilter("popular")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                discographyFilter === "popular"
                  ? "bg-white text-black"
                  : "bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              Popular releases
            </button>
            <button
              onClick={() => setDiscographyFilter("albums")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                discographyFilter === "albums"
                  ? "bg-white text-black"
                  : "bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              Albums
            </button>
            <button
              onClick={() => setDiscographyFilter("singles")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                discographyFilter === "singles"
                  ? "bg-white text-black"
                  : "bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              Singles & EPs
            </button>
          </div>
        </div>

        {/* Album / Release Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {discographyFilter === "albums" ? (
            albums.map((album) => (
              <div
                key={album.id}
                onClick={() => onNavigateToTab("discography")}
                className="bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md p-3.5 rounded-2xl space-y-3 cursor-pointer group transition-all"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 shadow-md">
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute right-2 bottom-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-xl">
                    <button className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg hover:scale-105 cursor-pointer">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                    {album.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400">{album.releaseYear} • Album</p>
                </div>
              </div>
            ))
          ) : discographyFilter === "singles" ? (
            tracks.slice(0, 5).map((single) => (
              <div
                key={single.id}
                onClick={() => onPlayTrack(single)}
                className="bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md p-3.5 rounded-2xl space-y-3 cursor-pointer group transition-all"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 shadow-md">
                  <img
                    src={single.coverUrl}
                    alt={single.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute right-2 bottom-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-xl">
                    <button className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg hover:scale-105 cursor-pointer">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                    {single.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400">2026 • Single</p>
                </div>
              </div>
            ))
          ) : (
            [...albums.slice(0, 2), ...tracks.slice(0, 3)].map((item: any, idx) => {
              const isAlbum = "releaseYear" in item;
              return (
                <div
                  key={item.id || idx}
                  onClick={() => isAlbum ? onNavigateToTab("discography") : onPlayTrack(item)}
                  className="bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md p-3.5 rounded-2xl space-y-3 cursor-pointer group transition-all"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 shadow-md">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute right-2 bottom-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-xl">
                      <button className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg hover:scale-105 cursor-pointer">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      {isAlbum ? `${item.releaseYear} • Album` : "2026 • Single"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 3. FEATURING PLAYLISTS */}
      {playlists.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Featuring {artist?.name || "the Artist"}
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => onNavigateToTab("playlists")}
                className="bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md p-3.5 rounded-2xl space-y-3 cursor-pointer group transition-all"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 shadow-md">
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute right-2 bottom-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-xl">
                    <button className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg hover:scale-105 cursor-pointer">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                    {playlist.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {playlist.type || "Official"} • {playlist.trackCount} songs
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. FANS ALSO LIKE */}
      {similarArtists.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Fans Also Like</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {similarArtists.map((otherArtist) => (
              <div
                key={otherArtist.uid}
                onClick={() => navigate(`/artist/${otherArtist.uid}`)}
                className="bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md p-4 rounded-3xl space-y-3 cursor-pointer group transition-all flex flex-col items-center text-center shadow-lg"
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-lg bg-neutral-950">
                  <img
                    src={otherArtist.avatarUrl}
                    alt={otherArtist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute right-1 bottom-1 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-xl">
                    <div className="w-8 h-8 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="space-y-0.5 w-full">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                    {otherArtist.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400">Artist</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. ABOUT PREVIEW CARD */}
      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">About</h2>

        <div
          onClick={() => onNavigateToTab("about")}
          className="relative min-h-[300px] rounded-3xl overflow-hidden cursor-pointer group p-6 sm:p-8 flex flex-col justify-end bg-neutral-950 shadow-2xl"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60"
            style={{
              backgroundImage: `url(${artist?.bannerUrl || artist?.bannerImageUrl || artist?.coverPhoto || artist?.avatarUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=600&fit=crop"})`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-bold text-white block">
                {(artist?.monthlyListeners || 184500).toLocaleString()} monthly on-chain listeners
              </span>
              <p className="text-xs sm:text-sm text-neutral-200 line-clamp-3 leading-relaxed">
                {artist?.bio || "Shaping the frontier of decentralized Web3 audio, generative rhythm synthesis, and real-time community royalty streaming pools."}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-bold text-white group-hover:underline flex items-center gap-1">
                Read full bio & channels <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default OverviewTab;
