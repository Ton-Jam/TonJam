import React from 'react';
import { X, Plus, Music } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

interface AddToPlaylistModalProps {
  track: Track;
  onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ track, onClose }) => {
  const { playlists, addTrackToPlaylist, addNotification, setIsCreatePlaylistModalOpen } = useAudio();

  const handleAdd = (playlistId: string, playlistName: string) => {
    addTrackToPlaylist(playlistId, track);
    addNotification(`Added "${track.title}" to "${playlistName}"`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm glass border border-border bg-background rounded-[12px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-3 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
            <h2 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Add to Playlist</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" aria-label="Close Add to Playlist Modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-2 space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {playlists.map(playlist => (
            <button 
              key={playlist.id} 
              onClick={() => handleAdd(playlist.id, playlist.title)}
              className="w-full flex items-center gap-3 p-3 rounded-[10px] hover:bg-muted/50 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="w-10 h-10 rounded-[6px] bg-muted/50 flex items-center justify-center overflow-hidden border border-border/50">
                <img src={playlist.coverUrl || getPlaceholderImage(`playlist-${playlist.id}`)} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-tight block truncate">{playlist.title}</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{playlist.trackIds?.length || 0} tracks</span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-2 border-t border-border/50">
          <button 
            onClick={() => {
              onClose();
              setIsCreatePlaylistModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[8px] bg-blue-600/10 border border-neutral-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-[9px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Plus className="h-3 w-3" /> Create New Playlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
