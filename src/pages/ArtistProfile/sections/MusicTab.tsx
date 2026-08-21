import * as React from "react";
import { Track } from "@/types";
import { Play, Pause, Heart, Download, Share2, Plus, MoreHorizontal, ArrowUpDown, AlertCircle, Gem } from "lucide-react";
import { toast } from "sonner";
import { useAudio } from "@/contexts/AudioContext";

interface MusicTabProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  trackSort: "plays" | "newest" | "title";
  onSortChange: (sort: "plays" | "newest" | "title") => void;
}

export const MusicTab: React.FC<MusicTabProps> = ({
  tracks,
  onPlayTrack,
  trackSort,
  onSortChange
}) => {
  const { currentTrack, isPlaying } = useAudio();
  const [likedTracks, setLikedTracks] = React.useState<Record<string, boolean>>({});

  const toggleLike = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTracks(prev => {
      const next = !prev[trackId];
      toast(next ? "Added to Liked Songs" : "Removed from Liked Songs");
      return { ...prev, [trackId]: next };
    });
  };

  const handleDownload = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Downloading: ${track.title}`);
  };

  const handleShare = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/track/${track.id}`);
    toast.success(`Copied link to clipboard!`);
  };

  const handleAddToPlaylist = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    toast(`Added ${track.title} to queue`);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="spotify-music-tab">
      
      {/* Search and Sort Toolbar */}
      <div className="flex items-center justify-between bg-neutral-900/40 px-4 py-3 rounded-xl shadow-sm">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          All Tracks ({tracks.length})
        </span>
        
        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
          <select 
            value={trackSort}
            onChange={(e) => onSortChange(e.target.value as "plays" | "newest" | "title")}
            className="bg-transparent border-none text-xs text-white font-bold cursor-pointer focus:outline-none uppercase tracking-wider"
          >
            <option value="plays" className="bg-neutral-950 text-white">Popularity</option>
            <option value="newest" className="bg-neutral-950 text-white">Newest First</option>
            <option value="title" className="bg-neutral-950 text-white">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Tracks Table (Spotify Style) */}
      {tracks.length > 0 ? (
        <div className="space-y-0.5">
          {tracks.map((track, idx) => {
            const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
            const isThisTrack = currentTrack?.id === track.id;
            const isLiked = likedTracks[track.id];

            return (
              <div 
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  isThisTrack ? "bg-white/[0.08]" : "hover:bg-white/[0.06]"
                }`}
              >
                {/* Left: Index / Play Icon, Cover, Title */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-5 text-center text-sm font-semibold text-neutral-400 flex items-center justify-center shrink-0">
                    {isCurrentPlaying ? (
                      <div className="w-3.5 h-3.5 flex items-center justify-center">
                        <span className="w-1 h-3 bg-[#1DB954] animate-pulse rounded-full mr-0.5" />
                        <span className="w-1 h-4 bg-[#1DB954] animate-pulse rounded-full delay-75 mr-0.5" />
                        <span className="w-1 h-2 bg-[#1DB954] animate-pulse rounded-full delay-150" />
                      </div>
                    ) : (
                      <>
                        <span className={`group-hover:hidden ${isThisTrack ? "text-[#1DB954]" : ""}`}>
                          {idx + 1}
                        </span>
                        <Play className="w-3.5 h-3.5 fill-current text-white hidden group-hover:block ml-0.5" />
                      </>
                    )}
                  </div>

                  <img 
                    src={track.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"} 
                    className="w-10 h-10 object-cover rounded-md shrink-0 shadow-md" 
                    alt="" 
                  />

                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-semibold truncate transition-colors ${
                        isThisTrack ? "text-[#1DB954]" : "text-white"
                      }`}>
                        {track.title}
                      </h4>
                      {track.isNFT && (
                        <span className="bg-purple-500/20 text-purple-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                          NFT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate">{track.genre || "Electronic"}</p>
                  </div>
                </div>

                {/* Middle: Stream count */}
                <div className="hidden sm:block text-right px-4">
                  <span className="text-xs font-mono text-neutral-400">
                    {(track.playCount || track.streams || 48200).toLocaleString()}
                  </span>
                </div>

                {/* Right: Actions & Duration */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => toggleLike(track.id, e)}
                    className={`p-1.5 transition-colors cursor-pointer ${
                      isLiked 
                        ? "text-[#1DB954]" 
                        : "text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-white"
                    }`}
                    title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  </button>

                  <span className="text-xs text-neutral-400 font-mono w-10 text-right">
                    {Math.floor((track.duration || 220) / 60)}:{(String((track.duration || 220) % 60)).padStart(2, "0")}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDownload(track, e)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                      title="Download offline"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={(e) => handleShare(track, e)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={(e) => handleAddToPlaylist(track, e)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                      title="Add to queue"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl bg-neutral-900/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-neutral-500" />
          <h4 className="text-base font-semibold text-white">No Tracks Found</h4>
          <p className="text-xs text-neutral-400 max-w-xs">This artist hasn't published tracks to this category yet.</p>
        </div>
      )}
    </div>
  );
};
