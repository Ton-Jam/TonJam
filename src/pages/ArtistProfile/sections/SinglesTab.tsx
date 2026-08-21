import * as React from "react";
import { Track } from "@/types";
import { Play, Pause, Heart, Download, Gem } from "lucide-react";
import { toast } from "sonner";
import { useAudio } from "@/contexts/AudioContext";

interface SinglesTabProps {
  singles: Track[];
  onPlayTrack: (track: Track) => void;
}

export const SinglesTab: React.FC<SinglesTabProps> = ({ singles, onPlayTrack }) => {
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

  return (
    <div className="space-y-6 animate-in fade-in" id="spotify-singles-tab">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">Singles & EPs</h3>
        <p className="text-xs text-neutral-400">Standalone tracks, remixes, and extended releases.</p>
      </div>

      {singles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {singles.map((single) => {
            const isThisTrack = currentTrack?.id === single.id;
            const isCurrentPlaying = isThisTrack && isPlaying;

            return (
              <div 
                key={single.id}
                onClick={() => onPlayTrack(single)}
                className="bg-neutral-900/40 hover:bg-neutral-900/80 p-3.5 rounded-xl space-y-3 cursor-pointer group transition-all"
              >
                <div className="relative aspect-square bg-neutral-950 rounded-lg overflow-hidden shadow-md">
                  <img 
                    src={single.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    alt={single.title} 
                  />
                  
                  {/* Floating Spotify Play Button */}
                  <div className="absolute right-2 bottom-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-2xl">
                    <button 
                      className="w-11 h-11 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform cursor-pointer"
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-5 h-5 fill-current text-black" />
                      ) : (
                        <Play className="w-5 h-5 fill-current text-black ml-0.5" />
                      )}
                    </button>
                  </div>

                  {single.isNFT && (
                    <div className="absolute top-2 right-2 bg-purple-500/90 text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded shadow-md flex items-center gap-1 backdrop-blur-sm">
                      <Gem className="w-2.5 h-2.5" /> NFT
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className={`text-sm font-bold truncate transition-colors ${
                    isThisTrack ? "text-[#1DB954]" : "text-white group-hover:text-[#1DB954]"
                  }`}>
                    {single.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>2026 • Single</span>
                    <span className="font-mono text-[10px]">
                      {Math.floor((single.duration || 210) / 60)}:{(String((single.duration || 210) % 60)).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl bg-neutral-900/30 text-center space-y-3">
          <h4 className="text-base font-semibold text-white">No Singles Found</h4>
          <p className="text-xs text-neutral-400 max-w-xs">No standalone singles available for this artist.</p>
        </div>
      )}
    </div>
  );
};
