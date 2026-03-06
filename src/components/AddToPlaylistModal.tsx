import React from 'react';
import { X, Plus, Music } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Track } from '@/types';

interface AddToPlaylistModalProps {
  track: Track;
  onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ track, onClose }) => {
  const { playlists, addTrackToPlaylist, addNotification } = useAudio();

  const handleAdd = (playlistId: string, playlistName: string) => {
    addTrackToPlaylist(playlistId, track);
    addNotification(`Added "${track.title}" to "${playlistName}"`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm glass border border-white/10 bg-[#0a0a0a] rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Add to Playlist</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
          {playlists.map(playlist => (
            <button 
              key={playlist.id} 
              onClick={() => handleAdd(playlist.id, playlist.title)}
              className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-white/5 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-[5px] bg-white/5 flex items-center justify-center overflow-hidden">
                {playlist.coverUrl ? (
                  <img src={playlist.coverUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <Music className="h-5 w-5 text-white/20" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-tight block">{playlist.title}</span>
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{playlist.trackIds?.length || 0} tracks</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
