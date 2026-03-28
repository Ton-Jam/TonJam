import React, { useState } from 'react';
import { ListMusic, Plus, Coins, Share2, Trash2, Heart, Info, User, Gem } from 'lucide-react';
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
}

const TrackOptionsModal: React.FC<TrackOptionsModalProps> = ({ track, onClose, onRemove }) => {
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
        addNotification(`Minting process started for ${track.title}`, 'success');
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

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background border-t border-border">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex items-center gap-4 mb-2">
              <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-16 h-16 rounded-md object-cover shadow-lg" alt="" />
              <div className="text-left">
                <DrawerTitle className="text-lg">{track.title}</DrawerTitle>
                <DrawerDescription className="text-sm">{track.artist}</DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          
          <div className="p-4 pt-0 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={option.action} 
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <option.icon className={`h-4 w-4 ${option.iconColor}`} />
                </div>
                <span className={`text-sm font-medium ${option.color}`}>{option.label}</span>
              </motion.button>
            ))}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full rounded-xl h-12">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TrackOptionsModal;

