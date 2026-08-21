import * as React from "react";
import { AlbumData } from "../types";
import { Play, Sparkles, FolderHeart } from "lucide-react";
import { toast } from "sonner";

interface AlbumsTabProps {
  albums: AlbumData[];
  onPlayAlbum: (albumId: string) => void;
}

export const AlbumsTab: React.FC<AlbumsTabProps> = ({ albums, onPlayAlbum }) => {
  const handlePlay = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Playing album: ${title}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="spotify-albums-tab">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">Albums</h3>
        <p className="text-xs text-neutral-400">Full length albums and studio compilations.</p>
      </div>

      {albums.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {albums.map((album) => (
            <div 
              key={album.id}
              onClick={() => onPlayAlbum(album.id)}
              className="bg-neutral-900/40 hover:bg-neutral-900/80 p-3.5 rounded-xl space-y-3 cursor-pointer group transition-all"
            >
              <div className="relative aspect-square bg-neutral-950 rounded-lg overflow-hidden shadow-md">
                <img 
                  src={album.coverUrl} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt={album.title} 
                />
                
                {/* Floating Spotify Play Button */}
                <div className="absolute right-2 bottom-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-2xl">
                  <button 
                    onClick={(e) => handlePlay(album.title, e)}
                    className="w-11 h-11 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>

                {album.isNFT && (
                  <div className="absolute top-2 right-2 bg-purple-500/90 text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded shadow-md flex items-center gap-1 backdrop-blur-sm">
                    <Sparkles className="w-2.5 h-2.5" /> NFT
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white group-hover:text-[#1DB954] transition-colors truncate">
                  {album.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{album.releaseYear} • Album</span>
                  <span className="font-mono text-[10px]">{album.trackCount} tracks</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl bg-neutral-900/30 text-center space-y-3">
          <FolderHeart className="w-8 h-8 text-neutral-500" />
          <h4 className="text-base font-semibold text-white">No Albums Found</h4>
          <p className="text-xs text-neutral-400 max-w-xs">This artist hasn't released studio albums yet.</p>
        </div>
      )}
    </div>
  );
};
