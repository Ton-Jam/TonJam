import React, { useState } from 'react';
import { ListMusic, Plus, Coins, Share2, Trash2 } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import AddToPlaylistModal from './AddToPlaylistModal';

interface TrackOptionsModalProps {
  track: Track;
  onClose: () => void;
  onRemove?: () => void;
}

const TrackOptionsModal: React.FC<TrackOptionsModalProps> = ({ track, onClose, onRemove }) => {
  const { addNotification, addToQueue } = useAudio();
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);

  const handleAction = async (action: string) => {
    switch (action) {
      case 'queue':
        addToQueue(track);
        onClose();
        break;
      case 'playlist':
        setShowAddToPlaylistModal(true);
        break;
      case 'tip':
        addNotification(`Tip protocol initiated for ${track.artist}`, 'success');
        onClose();
        break;
      case 'share':
        const shareUrl = `${window.location.origin}/#/track/${track.id}`;
        const shareData = {
          title: track.title,
          text: `Check out ${track.title} by ${track.artist} on TonJam!`,
          url: shareUrl
        };

        if (navigator.share) {
          navigator.share(shareData).catch(console.error);
        } else {
          navigator.clipboard.writeText(shareUrl);
          addNotification('Track link copied to neural buffer', 'success');
        }
        onClose();
        break;
    }
  };

  if (showAddToPlaylistModal) {
    return <AddToPlaylistModal track={track} onClose={() => { setShowAddToPlaylistModal(false); onClose(); }} />;
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#0a192f]/90 backdrop-blur-xl border border-blue-500/20 w-full max-w-sm rounded-[16px] overflow-hidden shadow-[0_0_50px_rgba(10,25,47,0.8)] animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
          <img src={track.coverUrl} className="w-16 h-16 rounded-[12px] object-cover shadow-lg border border-white/10" alt="" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[200px]">{track.title}</h3>
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{track.artist}</p>
          </div>
        </div>
        <div className="p-2 space-y-1">
          <button onClick={() => handleAction('queue')} className="w-full flex items-center gap-4 p-4 rounded-[12px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:text-cyan-300 transition-colors">
              <ListMusic className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-white/80 group-hover:text-white uppercase tracking-widest transition-colors">Add to Queue</span>
          </button>
          <button onClick={() => handleAction('playlist')} className="w-full flex items-center gap-4 p-4 rounded-[12px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:text-cyan-300 transition-colors">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-white/80 group-hover:text-white uppercase tracking-widest transition-colors">Add to Playlist</span>
          </button>
          <button onClick={() => handleAction('tip')} className="w-full flex items-center gap-4 p-4 rounded-[12px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
              <Coins className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-white/80 group-hover:text-white uppercase tracking-widest transition-colors">Tip Producer</span>
          </button>
          <button onClick={() => handleAction('share')} className="w-full flex items-center gap-4 p-4 rounded-[12px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
              <Share2 className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-white/80 group-hover:text-white uppercase tracking-widest transition-colors">Share Track</span>
          </button>
          {onRemove && (
            <button onClick={() => { onRemove(); onClose(); }} className="w-full flex items-center gap-4 p-4 rounded-[12px] hover:bg-red-500/10 transition-all text-left group">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 group-hover:text-red-300 transition-colors">
                <Trash2 className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold text-red-400 group-hover:text-red-300 uppercase tracking-widest transition-colors">Remove from Playlist</span>
            </button>
          )}
        </div>
        <button onClick={onClose} className="w-full p-4 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] hover:text-white hover:bg-white/5 transition-colors border-t border-white/5">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TrackOptionsModal;

