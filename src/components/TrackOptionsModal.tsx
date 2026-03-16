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
          navigator.share(shareData).catch((err) => {
            if (err.name !== 'AbortError') {
              console.error('Error sharing:', err);
            }
          });
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
      <div className="relative bg-white border border-blue-500/30 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-blue-500/30 flex items-center gap-4 bg-neutral-100">
          <img src={track.coverUrl} className="w-16 h-16 rounded-md object-cover shadow-lg" alt="" />
          <div>
            <h3 className="text-sm font-bold text-black truncate max-w-[200px]">{track.title}</h3>
            <p className="text-xs text-neutral-600">{track.artist}</p>
          </div>
        </div>
        <div className="p-2 space-y-1">
          <button onClick={() => handleAction('queue')} className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-100 transition-all text-left group">
            <ListMusic className="h-5 w-5 text-neutral-400 group-hover:text-black" />
            <span className="text-sm font-medium text-black">Add to Queue</span>
          </button>
          <button onClick={() => handleAction('playlist')} className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-100 transition-all text-left group">
            <Plus className="h-5 w-5 text-neutral-400 group-hover:text-black" />
            <span className="text-sm font-medium text-black">Add to Playlist</span>
          </button>
          <button onClick={() => handleAction('tip')} className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-100 transition-all text-left group">
            <Coins className="h-5 w-5 text-neutral-400 group-hover:text-black" />
            <span className="text-sm font-medium text-black">Tip Producer</span>
          </button>
          <button onClick={() => handleAction('share')} className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-100 transition-all text-left group">
            <Share2 className="h-5 w-5 text-neutral-400 group-hover:text-black" />
            <span className="text-sm font-medium text-black">Share Track</span>
          </button>
          {onRemove && (
            <button onClick={() => { onRemove(); onClose(); }} className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-100 transition-all text-left group">
              <Trash2 className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-500">Remove from Playlist</span>
            </button>
          )}
        </div>
        <button onClick={onClose} className="w-full p-4 text-sm font-bold text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors border-t border-blue-500/30">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TrackOptionsModal;

