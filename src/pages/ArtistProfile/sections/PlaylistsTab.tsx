import * as React from "react";
import { PlaylistData } from "../types";
import { ListMusic, Play } from "lucide-react";
import { toast } from "sonner";

interface PlaylistsTabProps {
  playlists: PlaylistData[];
}

export const PlaylistsTab: React.FC<PlaylistsTabProps> = ({ playlists }) => {
  const handlePlayPlaylist = (name: string) => {
    toast.success(`Playing playlist: ${name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="spotify-playlists-tab">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">Playlists</h3>
        <p className="text-xs text-neutral-400">Curated playlists and guest selections featuring this artist.</p>
      </div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {playlists.map((play) => (
            <div 
              key={play.id}
              onClick={() => handlePlayPlaylist(play.name)}
              className="bg-neutral-900/40 hover:bg-neutral-900/80 p-3.5 rounded-xl space-y-3 cursor-pointer group transition-all"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-950 shadow-md">
                <img 
                  src={play.coverUrl} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt={play.name} 
                />
                
                {/* Floating Spotify Play Button */}
                <div className="absolute right-2 bottom-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-2xl">
                  <button 
                    className="w-11 h-11 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white group-hover:text-[#1DB954] transition-colors truncate">
                  {play.name}
                </h4>
                <p className="text-xs text-neutral-400 line-clamp-1">
                  {play.trackCount} tracks • {(play.plays / 1000).toFixed(0)}K plays
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl bg-neutral-900/30 text-center space-y-3">
          <ListMusic className="w-8 h-8 text-neutral-500" />
          <h4 className="text-base font-semibold text-white">No Playlists Found</h4>
          <p className="text-xs text-neutral-400 max-w-xs">This artist hasn't published playlists yet.</p>
        </div>
      )}
    </div>
  );
};
