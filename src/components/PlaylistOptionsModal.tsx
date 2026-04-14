import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pencil, Trash2, Share2 } from 'lucide-react';
import { Playlist } from '@/types';

interface PlaylistOptionsModalProps {
  playlist: Playlist;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PlaylistOptionsModal: React.FC<PlaylistOptionsModalProps> = ({ playlist, onClose, onEdit, onDelete }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full sm:w-[400px] bg-background border border-border sm:rounded-2xl rounded-t-2xl p-4 shadow-2xl z-10 pb-8 sm:pb-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
              {playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {playlist.title.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground truncate max-w-[200px]">{playlist.title}</h3>
              <p className="text-xs text-muted-foreground">{playlist.creator}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <button 
            onClick={() => { onEdit(); onClose(); }}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors text-left"
          >
            <Pencil className="w-5 h-5 text-foreground" />
            <span className="font-medium text-foreground">Edit Playlist</span>
          </button>
          <button 
            onClick={() => {
              const shareData = {
                title: playlist.title,
                text: `Check out this playlist: ${playlist.title} on TonJam!`,
                url: window.location.href
              };
              if (navigator.share) {
                navigator.share(shareData).catch(console.error);
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
              onClose();
            }}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors text-left"
          >
            <Share2 className="w-5 h-5 text-foreground" />
            <span className="font-medium text-foreground">Share</span>
          </button>
          <button 
            onClick={() => { onDelete(); onClose(); }}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-left group"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-500">Delete Playlist</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PlaylistOptionsModal;
