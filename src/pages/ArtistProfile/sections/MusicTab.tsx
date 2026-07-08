import * as React from "react";
import { Track } from "@/types";
import { Play, Heart, Download, Share2, Plus, MoreHorizontal, ArrowUpDown, HelpCircle, AlertCircle, Gem } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const updated = !prev[id];
      toast(updated ? "Added to Liked Songs" : "Removed from Liked Songs");
      return { ...prev, [id]: updated };
    });
  };

  const handleDownload = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Downloading track offline: ${track.title}`);
  };

  const handleShare = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/track/${track.id}`);
    toast.success(`Copied sharing link to clipboard!`);
  };

  const handleAddToPlaylist = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    toast(`Added ${track.title} to play queue`);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="music-tab-root">
      
      {/* Search and Sort Toolbar */}
      <div className="flex items-center justify-between bg-neutral-900/30 p-4 rounded-[10px] border border-neutral-800/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tracks ({tracks.length})</span>
        </div>
        
        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <select 
            value={trackSort}
            onChange={(e) => onSortChange(e.target.value as "plays" | "newest" | "title")}
            className="bg-transparent border-none text-xs text-white font-bold cursor-pointer focus:outline-none uppercase tracking-wider"
          >
            <option value="plays" className="bg-neutral-950 text-white">Popularity</option>
            <option value="newest" className="bg-neutral-950 text-white">Newest First</option>
            <option value="title" className="bg-neutral-950 text-white">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Tracks Table */}
      {tracks.length > 0 ? (
        <div className="space-y-1">
          {tracks.map((track, idx) => (
            <div 
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className="group flex items-center justify-between p-3 rounded-[10px] hover:bg-neutral-900/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Track Index/Play Hover */}
                <div className="w-6 text-center text-xs font-bold text-muted-foreground flex items-center justify-center">
                  <span className="group-hover:hidden">{idx + 1}</span>
                  <Play className="w-3 h-3 fill-current text-white hidden group-hover:block" />
                </div>

                {/* Album Cover */}
                <img 
                  src={track.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"} 
                  className="w-10 h-10 object-cover rounded-[6px]" 
                  alt="" 
                />

                {/* Title & Genre */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">{track.title}</h4>
                    {track.isNFT && (
                      <span className="flex items-center gap-0.5 text-[8px] font-black text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-[4px] uppercase tracking-widest">
                        <Gem className="w-2.5 h-2.5" /> NFT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{track.genre}</p>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center gap-4 md:gap-8">
                {/* Play count */}
                <span className="text-xs font-mono text-muted-foreground hidden sm:block">
                  {(track.playCount || 0).toLocaleString()} plays
                </span>

                {/* Track Duration */}
                <span className="text-xs text-muted-foreground font-mono">
                  {Math.floor((track.duration || 220) / 60)}:{(String((track.duration || 220) % 60)).padStart(2, '0')}
                </span>

                {/* Quick Interactive Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => toggleFavorite(track.id, e)}
                    className={cn(
                      "p-1.5 rounded-full hover:bg-white/5 transition-colors",
                      favorites[track.id] ? "text-red-500" : "text-muted-foreground hover:text-white"
                    )}
                    title="Like Song"
                  >
                    <Heart className="w-3.5 h-3.5" fill={favorites[track.id] ? "currentColor" : "none"} />
                  </button>
                  
                  <button 
                    onClick={(e) => handleDownload(track, e)}
                    className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                    title="Download offline"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={(e) => handleShare(track, e)}
                    className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                    title="Share link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={(e) => handleAddToPlaylist(track, e)}
                    className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                    title="Add to queue"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-[10px] text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
          <h4 className="text-base font-semibold text-white">No Tracks Found</h4>
          <p className="text-xs text-muted-foreground max-w-xs">This artist hasn't published any releases to their ledger yet.</p>
        </div>
      )}
    </div>
  );
};
