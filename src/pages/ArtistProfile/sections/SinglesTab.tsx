import * as React from "react";
import { Track } from "@/types";
import { Play, Heart, Download, Gem, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SinglesTabProps {
  singles: Track[];
  onPlayTrack: (track: Track) => void;
}

export const SinglesTab: React.FC<SinglesTabProps> = ({ singles, onPlayTrack }) => {
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
    toast.success(`Downloading single: ${track.title}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="singles-tab-root">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold tracking-tight text-white">Standalone Singles</h3>
        <p className="text-xs text-muted-foreground">Individual audio releases and decentralized sound experiments.</p>
      </div>

      {singles.length > 0 ? (
        <div className="space-y-1">
          {singles.map((track, idx) => (
            <div 
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className="group flex items-center justify-between p-3 rounded-[10px] hover:bg-neutral-900/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-6 text-center text-xs font-bold text-muted-foreground flex items-center justify-center">
                  <span className="group-hover:hidden">{idx + 1}</span>
                  <Play className="w-3 h-3 fill-current text-white hidden group-hover:block" />
                </div>

                <img 
                  src={track.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"} 
                  className="w-10 h-10 object-cover rounded-[6px]" 
                  alt="" 
                />

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

              <div className="flex items-center gap-4 md:gap-8">
                <span className="text-xs font-mono text-muted-foreground hidden sm:block">
                  {(track.playCount || 0).toLocaleString()} plays
                </span>

                <span className="text-xs text-muted-foreground font-mono">
                  {Math.floor((track.duration || 220) / 60)}:{(String((track.duration || 220) % 60)).padStart(2, '0')}
                </span>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleDownload(track, e)}
                    className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                    title="Download offline"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-[10px] text-center space-y-3">
          <p className="text-sm text-muted-foreground">No standalone singles available.</p>
        </div>
      )}
    </div>
  );
};
