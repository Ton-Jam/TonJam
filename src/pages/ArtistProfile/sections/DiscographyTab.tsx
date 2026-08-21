import * as React from "react";
import { Track, NFTItem, Artist } from "@/types";
import { AlbumData } from "../types";
import { 
  Play, Pause, Disc, Sparkles, Clock, Music2, 
  Layers, ExternalLink, Share2, Heart, Plus, ChevronDown, ChevronUp,
  Radio, Check
} from "lucide-react";
import { toast } from "sonner";
import { useAudio } from "@/contexts/AudioContext";
import { motion, AnimatePresence } from "motion/react";

interface DiscographyTabProps {
  artist: Artist;
  albums: AlbumData[];
  singles: Track[];
  tracks: Track[];
  nfts: NFTItem[];
  onPlayTrack: (track: Track) => void;
  onPlayAlbum: (albumId: string) => void;
}

export const DiscographyTab: React.FC<DiscographyTabProps> = ({
  artist,
  albums,
  singles,
  tracks,
  nfts,
  onPlayTrack,
  onPlayAlbum
}) => {
  const { currentTrack, isPlaying, togglePlay } = useAudio();
  const [filter, setFilter] = React.useState<"all" | "albums" | "singles" | "nfts">("all");
  const [expandedAlbumId, setExpandedAlbumId] = React.useState<string | null>(albums[0]?.id || null);
  const [likedMap, setLikedMap] = React.useState<Record<string, boolean>>({});

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMap(prev => {
      const next = !prev[id];
      toast(next ? "Saved to your library" : "Removed from library");
      return { ...prev, [id]: next };
    });
  };

  const toggleExpandAlbum = (albumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedAlbumId(prev => prev === albumId ? null : albumId);
  };

  // Discography summary numbers
  const totalReleases = albums.length + singles.length;
  const totalNFTDrops = nfts.length + albums.filter(a => a.isNFT).length;

  return (
    <div className="space-y-8 animate-in fade-in" id="tonjam-discography-tab">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Discography
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.08] text-neutral-300">
              {totalReleases} Releases
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Full studio discography, cryptographic audio masters, singles, and NFT pressings.
          </p>
        </div>

        {/* Filter Pills (Dark Glass, No Border Lines) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all", label: "All Releases" },
            { id: "albums", label: `Albums (${albums.length})` },
            { id: "singles", label: `Singles & EPs (${singles.length})` },
            { id: "nfts", label: `NFT Collectibles (${totalNFTDrops})` },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap outline-none border-none ${
                  isActive 
                    ? "bg-white text-black shadow-lg" 
                    : "bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Full Albums Section */}
      {(filter === "all" || filter === "albums") && albums.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">
              Studio Albums & LPs
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              {albums.length} Full Albums
            </span>
          </div>

          <div className="space-y-4">
            {albums.map((album) => {
              const isExpanded = expandedAlbumId === album.id;
              const albumTracks = tracks.slice(0, album.trackCount || 6);

              return (
                <div 
                  key={album.id}
                  className="bg-neutral-900/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 transition-all overflow-hidden"
                >
                  {/* Album Banner & Metadata Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-950 shadow-lg group">
                        <img 
                          src={album.coverUrl} 
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() => onPlayAlbum(album.id)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                          title="Play album"
                        >
                          <Play className="w-7 h-7 fill-current text-[#1DB954]" />
                        </button>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base sm:text-lg font-bold text-white truncate">
                            {album.title}
                          </h4>
                          {album.isNFT && (
                            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> NFT Master
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <span>{album.releaseYear} • Album</span>
                          <span>•</span>
                          <span>{album.trackCount} Tracks</span>
                          <span>•</span>
                          <span className="font-mono">{album.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Controls: Play Album, Expand Tracklist, Like */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => onPlayAlbum(album.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:scale-105 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play</span>
                      </button>

                      <button
                        onClick={(e) => toggleExpandAlbum(album.id, e)}
                        className="flex items-center gap-1 px-3 py-2 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? "Hide Tracks" : "Tracklist"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Tracklist within Dark Glass Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-5 pt-4 overflow-hidden"
                      >
                        <div className="space-y-1 bg-white/[0.02] p-2.5 sm:p-3 rounded-xl">
                          {albumTracks.map((track, idx) => {
                            const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                            const isThisTrack = currentTrack?.id === track.id;

                            return (
                              <div
                                key={track.id || idx}
                                onClick={() => onPlayTrack(track)}
                                className={`group flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer ${
                                  isThisTrack ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <span className="w-5 text-center text-xs font-mono text-neutral-500 group-hover:text-white">
                                    {isCurrentPlaying ? (
                                      <span className="text-[#1DB954] font-bold">▶</span>
                                    ) : (
                                      idx + 1
                                    )}
                                  </span>

                                  <div className="min-w-0">
                                    <h5 className={`text-xs sm:text-sm font-semibold truncate ${
                                      isThisTrack ? "text-[#1DB954]" : "text-white"
                                    }`}>
                                      {track.title}
                                    </h5>
                                    <span className="text-[11px] text-neutral-400">
                                      {track.genre || "Electronic Master"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                  <span className="text-xs text-neutral-400 font-mono">
                                    {Math.floor((track.duration || 210) / 60)}:{(String((track.duration || 210) % 60)).padStart(2, "0")}
                                  </span>
                                  <button
                                    onClick={(e) => toggleLike(track.id, e)}
                                    className="p-1 text-neutral-400 hover:text-[#1DB954] transition-colors"
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${likedMap[track.id] ? "fill-current text-[#1DB954]" : ""}`} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Singles & EPs Grid */}
      {(filter === "all" || filter === "singles") && singles.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">
              Singles & EPs
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              {singles.length} Releases
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {singles.map((single) => {
              const isCurrentPlaying = currentTrack?.id === single.id && isPlaying;
              const isThisTrack = currentTrack?.id === single.id;

              return (
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
                    
                    <div className="absolute right-2 bottom-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-2xl">
                      <button 
                        className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform cursor-pointer"
                        title="Play single"
                      >
                        {isCurrentPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    {single.isNFT && (
                      <div className="absolute top-2 right-2 bg-purple-500/90 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1 backdrop-blur-sm">
                        <Sparkles className="w-2.5 h-2.5" /> NFT
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                      isThisTrack ? "text-[#1DB954]" : "text-white group-hover:text-[#1DB954]"
                    }`}>
                      {single.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Single</span>
                      <span className="font-mono">{(single.playCount || 54200).toLocaleString()} plays</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Music NFT Collectibles Grid */}
      {(filter === "all" || filter === "nfts") && nfts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Music NFT Collectibles & Master Editions
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              {nfts.length} Collectibles
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                className="bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-md p-3.5 rounded-2xl space-y-3 transition-all"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 shadow-md">
                  <img 
                    src={nft.imageUrl || (nft as any).image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"} 
                    alt={(nft as any).name || nft.title}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-white">
                    {nft.edition || "1 of 10"}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-[#0098EA] text-white px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shadow-md">
                    {nft.price} TON
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {(nft as any).name || nft.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{nft.rarity || "Rare Master"}</span>
                    <span className="text-[#1DB954] font-semibold">Royalty: 10%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default DiscographyTab;
