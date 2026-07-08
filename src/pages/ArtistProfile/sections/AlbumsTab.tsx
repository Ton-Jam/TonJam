import * as React from "react";
import { AlbumData } from "../types";
import { Play, Sparkles, FolderHeart, AlertTriangle } from "lucide-react";
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
    <div className="space-y-6 animate-in fade-in" id="albums-tab-root">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold tracking-tight text-white font-sans">Discography Albums</h3>
        <p className="text-xs text-muted-foreground">Studio compilations and web3 vinyl catalogs created by the artist.</p>
      </div>

      {albums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <div 
              key={album.id}
              onClick={() => onPlayAlbum(album.id)}
              className="bg-neutral-900/25 border border-neutral-900 hover:border-neutral-800 p-3 rounded-[10px] space-y-4 cursor-pointer group transition-all"
            >
              <div className="relative aspect-square bg-neutral-950 rounded-[10px] overflow-hidden">
                <img 
                  src={album.coverUrl} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="" 
                />
                
                {/* Album Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={(e) => handlePlay(album.title, e)}
                    className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer border-none"
                  >
                    <Play className="w-5 h-5 fill-current text-black ml-0.5" />
                  </button>
                </div>

                {album.isNFT && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[4px] flex items-center gap-1 shadow-md">
                    <Sparkles className="w-2.5 h-2.5" /> NFT Album
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{album.title}</h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{album.releaseYear} • {album.trackCount} Songs</span>
                  <span className="font-mono text-[10px]">{album.duration}</span>
                </div>
                {album.isNFT && album.floorPrice && (
                  <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Floor Price:</span>
                    <span className="text-purple-400 font-bold font-mono">{album.floorPrice}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-[10px] text-center space-y-3">
          <FolderHeart className="w-8 h-8 text-muted-foreground" />
          <h4 className="text-base font-semibold text-white">No Albums Found</h4>
          <p className="text-xs text-muted-foreground max-w-xs">This creator hasn't bundled songs into collections or albums yet.</p>
        </div>
      )}
    </div>
  );
};
