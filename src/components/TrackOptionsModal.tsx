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
      <DrawerContent className="bg-[#121212] border-none shadow-2xl">
        <div className="mx-auto w-full max-w-md relative z-10">
          <DrawerHeader className="pb-4 pt-4">
            <div className="flex items-center gap-4">
              <img 
                src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
                className="w-14 h-14 rounded-sm object-cover shadow-lg" 
                alt={track.title} 
              />
              <div className="text-left flex-1 min-w-0">
                <DrawerTitle className="text-lg font-bold text-white truncate leading-tight">
                  {track.title}
                </DrawerTitle>
                <DrawerDescription className="text-sm text-neutral-400 truncate">
                  {track.artist}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          
          <div className="p-2 space-y-0.5 pb-8">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={option.action} 
                className="w-full flex items-center gap-4 p-4 hover:bg-white/10 transition-all text-left group focus-visible:outline-none"
              >
                <option.icon className={`h-6 w-6 text-neutral-400 group-hover:text-white transition-colors`} />
                <span className={`text-sm font-medium text-white`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TrackOptionsModal;

