import React, { useState } from 'react';
import { ListMusic, Plus, Coins, Share2, Trash2, Heart, Info, User, Gem, ArrowUp, ArrowDown, ChevronRight, X } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { cn, getPlaceholderImage } from '@/lib/utils';
import AddToPlaylistModal from './AddToPlaylistModal';
import TrackMonetizationModal from './TrackMonetizationModal';
import { Button } from "@/components/ui/button"
import { motion } from 'motion/react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
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
  const { addNotification, addToQueue, likedTrackIds, toggleLikeTrack, userProfile } = useAudio();
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);

  const isLiked = likedTrackIds.includes(track.id);
  const isArtist = userProfile?.uid === track.artistId;

  const handleAction = async (action: string) => {
    switch (action) {
      case 'monetize':
        setShowMonetizationModal(true);
        break;
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
          addNotification('Track link copied to clipboard', 'success');
        }
        onClose();
        break;
    }
  };

  if (showAddToPlaylistModal) {
    return <AddToPlaylistModal track={track} onClose={() => { setShowAddToPlaylistModal(false); onClose(); }} />;
  }

  if (showMonetizationModal) {
    return <TrackMonetizationModal track={track} isOpen={true} onClose={() => { setShowMonetizationModal(false); onClose(); }} />;
  }

  const options = [
    { id: 'like', icon: Heart, label: isLiked ? 'Remove from Liked' : 'Like Track', color: isLiked ? 'text-red-500' : 'text-foreground', iconColor: isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground group-hover:text-red-400', action: () => handleAction('like') },
    ...(isArtist ? [{ id: 'monetize', icon: Coins, label: 'Configure Monetization', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('monetize') }] : []),
    { id: 'queue', icon: ListMusic, label: 'Add to Queue', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('queue') },
    { id: 'playlist', icon: Plus, label: 'Add to Playlist', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('playlist') },
    { id: 'artist', icon: User, label: 'View Artist', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('artist') },
    { id: 'details', icon: Info, label: 'View Details', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('details') },
    { id: 'tip', icon: Coins, label: 'Tip Artist (TON)', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-amber-400', action: () => handleAction('tip') },
    { id: 'mint', icon: Gem, label: 'Mint NFT', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-purple-400', action: () => handleAction('mint') },
    { id: 'share', icon: Share2, label: 'Share', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-emerald-400', action: () => handleAction('share') },
  ];

  if (onRemove) {
    options.push({ id: 'remove', icon: Trash2, label: 'Remove Signal', color: 'text-red-500', iconColor: 'text-red-500/40 group-hover:text-red-500', action: async () => { onRemove(); onClose(); } });
  }

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background border-none shadow-[0_-12px_40px_rgba(0,0,0,0.8)] rounded-t-3xl">
        <div className="mx-auto w-full max-w-md relative z-10 px-4 pb-12">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 rounded-full bg-white/10" />
          </div>

          <DrawerHeader className="pb-6 pt-4 flex flex-row items-center gap-4 text-left">
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
                className="w-full h-full object-cover" 
                alt={track.title} 
              />
            </div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-xl font-semibold text-foreground truncate">
                {track.title}
              </DrawerTitle>
              <DrawerDescription className="text-sm font-medium text-muted-foreground mt-1 truncate">
                {track.artist}
              </DrawerDescription>
              {(track.isNFT || track.price) && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-xs font-medium text-blue-500">
                    Track
                  </span>
                  {track.isNFT && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-xs font-medium text-purple-500">
                      Music NFT
                    </span>
                  )}
                </div>
              )}
            </div>
          </DrawerHeader>
          
          <div className="space-y-1 max-h-[50vh] overflow-y-auto no-scrollbar py-2">
            {options.map((option, index) => (
              <button
                key={option.id}
                onClick={option.action}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-left group focus-visible:outline-none"
              >
                <div className="flex items-center gap-3">
                  <option.icon className={cn("h-5 w-5", option.iconColor)} />
                  <span className={cn("text-base font-medium", option.color)}>
                    {option.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <DrawerClose asChild>
              <Button 
                variant="outline"
                className="w-full rounded-full h-12 text-base font-medium"
              >
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TrackOptionsModal;

