import React, { useState } from 'react';
import { ListMusic, Plus, Coins, Share2, Trash2, Heart, Info, User, Gem, ArrowUp, ArrowDown } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { getPlaceholderImage } from '@/lib/utils';
import AddToPlaylistModal from './AddToPlaylistModal';
import { Button } from "@/components/ui/button"
import { motion } from 'motion/react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface TrackOptionsModalProps {
  track: Track;
  onClose: () => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const TrackOptionsModal: React.FC<TrackOptionsModalProps> = ({ track, onClose, onRemove, onMoveUp, onMoveDown }) => {
  const navigate = useNavigate();
  const { addNotification, addToQueue, likedTrackIds, toggleLikeTrack } = useAudio();
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);

  const isLiked = likedTrackIds.includes(track.id);

  const handleAction = async (action: string) => {
    switch (action) {
      case 'queue':
        addToQueue(track);
        onClose();
        break;
      case 'playlist':
        setShowAddToPlaylistModal(true);
        break;
      case 'like':
        toggleLikeTrack(track.id);
        onClose();
        break;
      case 'details':
        navigate(`/track/${track.id}`);
        onClose();
        break;
      case 'artist':
        if (track.artistId) {
          navigate(`/artist/${track.artistId}`);
        }
        onClose();
        break;
      case 'tip':
        addNotification(`Tip protocol initiated for ${track.artist}`, 'success');
        onClose();
        break;
      case 'mint':
        navigate('/mint', { state: { track } });
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

  const options = [
    { id: 'like', icon: Heart, label: isLiked ? 'Liked' : 'Like Track', color: isLiked ? 'text-red-500' : 'text-foreground', iconColor: isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground group-hover:text-red-500', action: () => handleAction('like') },
    { id: 'queue', icon: ListMusic, label: 'Add to Queue', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('queue') },
    { id: 'playlist', icon: Plus, label: 'Add to Playlist', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('playlist') },
    { id: 'artist', icon: User, label: 'View Artist', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('artist') },
    { id: 'details', icon: Info, label: 'View Details', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('details') },
    { id: 'tip', icon: Coins, label: 'Tip Artist (TON)', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-amber-400', action: () => handleAction('tip') },
    { id: 'mint', icon: Gem, label: 'Mint as NFT', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-purple-400', action: () => handleAction('mint') },
    { id: 'share', icon: Share2, label: 'Share Track', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('share') },
  ];

  if (onRemove) {
    options.push({ id: 'remove', icon: Trash2, label: 'Remove from Playlist', color: 'text-red-500', iconColor: 'text-red-500/40 group-hover:text-red-500', action: async () => { onRemove(); onClose(); } });
  }

  if (onMoveUp) {
    options.push({ id: 'move-up', icon: ArrowUp, label: 'Move Up', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: async () => { onMoveUp(); onClose(); } });
  }

  if (onMoveDown) {
    options.push({ id: 'move-down', icon: ArrowDown, label: 'Move Down', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: async () => { onMoveDown(); onClose(); } });
  }

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#0A0A0A] border-t border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        {/* Hardware style scanline */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        <div className="mx-auto w-full max-w-md relative z-10">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 rounded-full bg-white/10" />
          </div>
          
          <DrawerHeader className="border-b border-white/5 pb-6 pt-4">
            <div className="flex items-center gap-5">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-20 h-20 rounded-[12px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-white/10 flex-shrink-0"
              >
                <img 
                  src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
                  className="w-full h-full object-cover" 
                  alt={track.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>
              <div className="text-left flex-1 min-w-0">
                <DrawerTitle className="text-2xl font-bold tracking-tighter text-white truncate leading-none uppercase">
                  {track.title}
                </DrawerTitle>
                <DrawerDescription className="text-[10px] text-blue-500 font-bold mt-2 flex items-center gap-2 uppercase tracking-[0.2em]">
                  {track.artist}
                  {track.artistVerified && (
                    <span className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="w-1 h-1 bg-white rounded-full" />
                    </span>
                  )}
                </DrawerDescription>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-1 rounded-[4px] bg-white/5 text-[8px] font-bold uppercase tracking-[0.3em] text-muted-foreground border border-white/5">
                    {track.genre}
                  </span>
                  {track.isNFT && (
                    <span className="px-2 py-1 rounded-[4px] bg-purple-500/10 text-[8px] font-bold uppercase tracking-[0.3em] text-purple-400 border border-purple-500/20">
                      NFT_ASSET
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DrawerHeader>
          
          <div className="p-4 pt-4 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar pb-8">
            <div className="grid grid-cols-1 gap-1">
              {options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, ease: "easeOut" }}
                  onClick={option.action} 
                  className="w-full flex items-center gap-4 p-3 rounded-[12px] hover:bg-white/5 active:bg-white/10 active:scale-[0.98] transition-all text-left group focus-visible:outline-none border border-transparent hover:border-white/5"
                >
                  <div className="w-10 h-10 rounded-[8px] bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 group-active:scale-90 transition-all border border-white/5 group-hover:border-blue-500/20">
                    <option.icon className={`h-4 w-4 ${option.iconColor} transition-transform group-hover:scale-110`} />
                  </div>
                  <div className="flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${option.color}`}>
                      {option.label}
                    </span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="p-4 pt-0 pb-8">
            <DrawerClose asChild>
              <Button 
                variant="secondary" 
                className="w-full rounded-[12px] h-12 font-bold text-[10px] uppercase tracking-[0.4em] bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-[0.98]"
              >
                Close_Interface
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TrackOptionsModal;

