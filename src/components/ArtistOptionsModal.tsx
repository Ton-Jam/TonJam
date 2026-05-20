import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserMinus, Flag, Share2, AlertTriangle } from 'lucide-react';
import { Artist } from '@/types';

interface ArtistOptionsModalProps {
  artist: Artist | null;
  onClose: () => void;
}

const ArtistOptionsModal: React.FC<ArtistOptionsModalProps> = ({ artist, onClose }) => {
  if (!artist) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-tight">Artist Options</h3>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            <button className="flex w-full items-center gap-4 p-4 rounded-[16px] hover:bg-muted transition-all text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <Share2 className="h-4 w-4" />
              Share Artist
            </button>
            <button className="flex w-full items-center gap-4 p-4 rounded-[16px] hover:bg-muted transition-all text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <UserMinus className="h-4 w-4" />
              Unfollow
            </button>
            <button className="flex w-full items-center gap-4 p-4 rounded-[16px] hover:bg-muted transition-all text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400">
              <Flag className="h-4 w-4" />
              Report Artist
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ArtistOptionsModal;
