import React, { useState, useMemo } from 'react';
import { X, Plus, Music, Search, Check, Disc } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

interface AddToPlaylistModalProps {
  track: Track;
  onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ track, onClose }) => {
  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist, addNotification, setIsCreatePlaylistModalOpen, setTrackToAddToPlaylist } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');

  const handleTogglePlaylist = (playlistId: string, playlistName: string, trackIds?: string[]) => {
    const isAlreadyInPlaylist = trackIds?.includes(track.id);
    if (isAlreadyInPlaylist) {
      removeTrackFromPlaylist(playlistId, track.id);
      addNotification(`Removed "${track.title}" from "${playlistName}"`, "info");
    } else {
      addTrackToPlaylist(playlistId, track);
      addNotification(`Added "${track.title}" to "${playlistName}"`, "success");
    }
  };

  const filteredPlaylists = useMemo(() => {
    const safeSearchQuery = typeof searchQuery === 'string' ? searchQuery : '';
    if (!safeSearchQuery.trim()) return playlists;
    
    const query = safeSearchQuery.toLowerCase().trim();
    return playlists.filter(playlist => 
      playlist.title.toLowerCase().includes(query)
    );
  }, [playlists, searchQuery]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#07111F]/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-[#0A1628] text-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-[#00B4D8] rounded-full shadow-[0_0_10px_#00B4D8]"></div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/9ns">Add to Playlist</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8]"
              aria-label="Close Add to Playlist Modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Track preview snippet */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03]">
            <img 
              src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
              alt={track.title} 
              className="w-10 h-10 rounded-lg object-cover bg-neutral-900 shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{track.title}</p>
              <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search your playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition-all"
            />
          </div>
        </div>

        {/* Playlists List */}
        <div className="p-3 space-y-1.5 max-h-[45vh] min-h-[220px] overflow-y-auto custom-scrollbar">
          {filteredPlaylists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Disc className="w-10 h-10 text-zinc-600 mb-3 animate-pulse" />
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No playlists found</p>
              <p className="text-[10px] text-zinc-500 mt-1">Create a new playlist below to add this track.</p>
            </div>
          ) : (
            filteredPlaylists.map(playlist => {
              const isInPlaylist = playlist.trackIds?.includes(track.id);
              return (
                <button 
                  key={playlist.id} 
                  onClick={() => handleTogglePlaylist(playlist.id, playlist.title, playlist.trackIds)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group cursor-pointer ${
                    isInPlaylist ? 'bg-[#00B4D8]/15 border border-[#00B4D8]/30' : 'hover:bg-white/[0.06] bg-transparent'
                  }`}
                >
                  <div className="w-11 h-11 rounded-lg bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0 relative">
                    <img 
                      src={playlist.coverUrl || getPlaceholderImage(`playlist-${playlist.id}`)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      alt="" 
                    />
                    {isInPlaylist && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                        <Check className="w-5 h-5 text-[#00B4D8] stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white truncate block">{playlist.title}</span>
                    <span className="text-[10px] font-medium text-zinc-400 mt-0.5 block">{playlist.trackIds?.length || 0} tracks</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isInPlaylist ? 'bg-[#00B4D8] text-white' : 'bg-white/10 text-zinc-400 group-hover:bg-white/20 group-hover:text-white'
                  }`}>
                    {isInPlaylist ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Create Action */}
        <div className="p-3 border-t border-white/[0.06] bg-[#07111F]/50">
          <button 
            onClick={() => {
              setTrackToAddToPlaylist(track);
              onClose();
              setIsCreatePlaylistModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00B4D8]/20 hover:bg-[#00B4D8]/30 text-[#00B4D8] transition-all text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-[#00B4D8]/10"
          >
            <Plus className="h-4 w-4" /> Create New Playlist & Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
