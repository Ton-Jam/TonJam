import * as React from "react";
import { PlaylistData } from "../types";
import { ListMusic, Play, Users, Disc } from "lucide-react";
import { toast } from "sonner";

interface PlaylistsTabProps {
  playlists: PlaylistData[];
}

export const PlaylistsTab: React.FC<PlaylistsTabProps> = ({ playlists }) => {
  const handlePlayPlaylist = (name: string) => {
    toast.success(`Playing playlist compilation: ${name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="playlists-tab-root">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold tracking-tight text-white">Curated Playlists</h3>
        <p className="text-xs text-muted-foreground">Compilations crafted by the artist, including cooperative folders open to community tuning.</p>
      </div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((play) => (
            <div 
              key={play.id}
              onClick={() => handlePlayPlaylist(play.name)}
              className="bg-neutral-900/25 border border-neutral-900 hover:border-neutral-800 p-4 rounded-[10px] flex items-center gap-4 cursor-pointer group transition-all"
            >
              <div className="relative w-16 h-16 rounded-[10px] overflow-hidden bg-neutral-950 shrink-0">
                <img 
                  src={play.coverUrl} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-current" />
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{play.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{play.trackCount} Songs • {(play.plays / 1000).toFixed(0)}K plays</p>
                <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[4px] ${
                  play.type === 'Official' 
                    ? "bg-cyan-500/10 text-cyan-400" 
                    : play.type === 'Collaborative' 
                      ? "bg-purple-500/10 text-purple-400" 
                      : "bg-neutral-800 text-neutral-300"
                }`}>
                  {play.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-[10px] text-center space-y-3">
          <ListMusic className="w-8 h-8 text-muted-foreground" />
          <h4 className="text-base font-semibold text-white">No Playlists Found</h4>
          <p className="text-xs text-muted-foreground max-w-xs">This artist hasn't published any official song compilations yet.</p>
        </div>
      )}
    </div>
  );
};
