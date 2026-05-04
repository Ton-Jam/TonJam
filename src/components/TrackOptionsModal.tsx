import React, { useState } from 'react';
import { ListMusic, Plus, Coins, Share2, Trash2, Heart, Info, User, Gem, ArrowUp, ArrowDown, ChevronRight, X } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { cn, getPlaceholderImage } from '@/lib/utils';
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
    { id: 'like', icon: Heart, label: isLiked ? 'Remove from Liked' : 'Like Track', color: isLiked ? 'text-red-500' : 'text-foreground', iconColor: isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground group-hover:text-red-400', action: () => handleAction('like') },
    { id: 'queue', icon: ListMusic, label: 'Add to Queue', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('queue') },
    { id: 'playlist', icon: Plus, label: 'Add to Playlist', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('playlist') },
    { id: 'artist', icon: User, label: 'View Artist', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('artist') },
    { id: 'details', icon: Info, label: 'View Detailed Data', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-cyan-400', action: () => handleAction('details') },
    { id: 'tip', icon: Coins, label: 'Tip Artist (TON)', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-amber-400', action: () => handleAction('tip') },
    { id: 'mint', icon: Gem, label: 'Mint Generic NFT', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-purple-400', action: () => handleAction('mint') },
    { id: 'share', icon: Share2, label: 'Share Signal', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-emerald-400', action: () => handleAction('share') },
  ];

  if (onRemove) {
    options.push({ id: 'remove', icon: Trash2, label: 'Remove from Sequence', color: 'text-red-500', iconColor: 'text-red-500/40 group-hover:text-red-500', action: async () => { onRemove(); onClose(); } });
  }

  if (onMoveUp) {
    options.push({ id: 'move-up', icon: ArrowUp, label: 'Shift Upward', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: async () => { onMoveUp(); onClose(); } });
  }

  if (onMoveDown) {
    options.push({ id: 'move-down', icon: ArrowDown, label: 'Shift Downward', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: async () => { onMoveDown(); onClose(); } });
  }

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#0A0A0B] border-none shadow-[0_-12px_40px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
        {/* Cyborg Tech Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_100%,100%_2px,3px_100%]" />
        
        <div className="mx-auto w-full max-w-md relative z-10 px-4 pb-12">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 rounded-full bg-white/10" />
          </div>

          <DrawerHeader className="pb-6 pt-4 flex flex-row items-center gap-4 text-left">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-20 h-20 rounded-[4px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 flex-shrink-0"
            >
              <img 
                src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
                className="w-full h-full object-cover" 
                alt={track.title} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-2xl font-black text-white truncate leading-none uppercase italic tracking-tighter">
                {track.title}
              </DrawerTitle>
              <DrawerDescription className="text-[10px] font-black text-blue-500 mt-2 uppercase tracking-[0.3em] truncate italic opacity-80">
                // ARTIST: {track.artist}
              </DrawerDescription>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-0.5 rounded-[2px] bg-blue-500/10 text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 border border-blue-500/20">
                  PROTOCOL_ACTIVE
                </span>
                {track.isNFT && (
                  <span className="px-2 py-0.5 rounded-[2px] bg-purple-500/10 text-[8px] font-black uppercase tracking-[0.2em] text-purple-400 border border-purple-500/20">
                    NFT_SIGNAL
                  </span>
                )}
              </div>
            </div>
          </DrawerHeader>
          
          <div className="space-y-1 max-h-[50vh] overflow-y-auto no-scrollbar py-2">
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={option.action}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 active:bg-white/10 active:scale-[0.98] transition-all text-left group focus-visible:outline-none border border-transparent hover:border-white/5"
              >
                <div className="w-10 h-10 rounded-[4px] bg-white/5 flex items-center justify-center transition-all group-hover:bg-blue-500/10 border border-white/5 group-hover:border-blue-500/20">
                  <option.icon className={cn("h-4 w-4 transition-all group-hover:scale-110", option.iconColor)} />
                </div>
                <div className="flex-1">
                  <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] transition-colors italic", option.color)}>
                    {option.label}
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-blue-500/40 transition-colors" />
              </motion.button>
            ))}
          </div>

          <div className="mt-4">
            <DrawerClose asChild>
              <Button 
                variant="ghost" 
                className="w-full rounded-[4px] h-14 font-black text-[10px] uppercase tracking-[0.5em] text-white/30 hover:text-white hover:bg-white/5 transition-all border border-white/5 italic"
              >
                Terminate_Interface
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TrackOptionsModal;
