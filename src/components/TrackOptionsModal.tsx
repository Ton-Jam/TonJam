import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ListMusic, 
  Plus, 
  Heart, 
  Share2, 
  Info, 
  User, 
  Coins, 
  Gem, 
  Trash2, 
  Flag, 
  Check, 
  ChevronRight, 
  X,
  BadgeCheck
} from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { useNavigate } from 'react-router-dom';
import { cn, getPlaceholderImage } from '@/lib/utils';
import { MOCK_ARTISTS } from '@/constants';
import AddToPlaylistModal from './AddToPlaylistModal';
import TrackMonetizationModal from './TrackMonetizationModal';
import TipArtistModal from './TipArtistModal';
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

interface TrackOptionsModalProps {
  track: Track;
  onClose: () => void;
  onRemove?: () => void;
}

const TrackOptionsModal: React.FC<TrackOptionsModalProps> = ({ track, onClose, onRemove }) => {
  const navigate = useNavigate();
  const { 
    addNotification, 
    addToQueue, 
    likedTrackIds, 
    toggleLikeTrack, 
    userProfile,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay
  } = useAudio();

  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);

  // Escape key handler for fast keyboard dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isLiked = likedTrackIds.includes(track.id);
  const isArtist = userProfile?.uid === track.artistId;
  const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
  
  // Check artist verification
  const artistData = MOCK_ARTISTS.find(a => a.uid === track.artistId || a.name === track.artist);
  const isVerified = Boolean(track.artistVerified || artistData?.verified || artistData?.isVerifiedArtist);

  const handleAction = async (action: string) => {
    switch (action) {
      case 'playback':
        if (currentTrack?.id === track.id) {
          togglePlay();
        } else {
          playTrack(track);
        }
        onClose();
        break;
      case 'queue':
        addToQueue(track);
        addNotification(`"${track.title}" added to queue`, 'info');
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
        } else if (artistData?.uid) {
          navigate(`/artist/${artistData.uid}`);
        } else {
          navigate(`/discover`);
        }
        onClose();
        break;
      case 'tip':
        setShowTipModal(true);
        break;
      case 'mint':
        if (track.isNFT) {
          navigate('/marketplace');
        } else {
          navigate('/mint', { state: { track } });
        }
        onClose();
        break;
      case 'monetize':
        setShowMonetizationModal(true);
        break;
      case 'share':
        const shareUrl = `${window.location.origin}/#/track/${track.id}`;
        const shareData = {
          title: track.title,
          text: `Check out "${track.title}" by ${track.artist} on TonJam!`,
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
      case 'report':
        addNotification('Thank you. Track has been reported for review.', 'info');
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

  if (showTipModal) {
    return <TipArtistModal track={track} onClose={() => { setShowTipModal(false); onClose(); }} />;
  }

  // Define structured actions
  const primaryActions = [
    {
      id: 'playback',
      icon: isCurrentPlaying ? Pause : Play,
      label: isCurrentPlaying ? 'Pause Track' : 'Play Track',
      color: 'text-text-primary',
      iconColor: isCurrentPlaying ? 'text-primary' : 'text-text-muted group-hover:text-primary',
      action: () => handleAction('playback')
    },
    {
      id: 'queue',
      icon: ListMusic,
      label: 'Add to Queue',
      color: 'text-text-primary',
      iconColor: 'text-text-muted group-hover:text-text-primary',
      action: () => handleAction('queue')
    },
    {
      id: 'playlist',
      icon: Plus,
      label: 'Add to Playlist',
      color: 'text-text-primary',
      iconColor: 'text-text-muted group-hover:text-text-primary',
      action: () => handleAction('playlist')
    },
    {
      id: 'like',
      icon: Heart,
      label: isLiked ? 'Remove from Liked' : 'Like Track',
      color: isLiked ? 'text-red-400' : 'text-text-primary',
      iconColor: isLiked ? 'text-red-500 fill-current' : 'text-text-muted group-hover:text-red-400',
      action: () => handleAction('like')
    },
  ];

  const detailActions = [
    {
      id: 'details',
      icon: Info,
      label: 'View Track Details',
      color: 'text-text-primary',
      iconColor: 'text-text-muted group-hover:text-text-primary',
      action: () => handleAction('details')
    },
    {
      id: 'artist',
      icon: User,
      label: `View Artist (${track.artist})`,
      color: 'text-text-primary',
      iconColor: 'text-text-muted group-hover:text-text-primary',
      action: () => handleAction('artist')
    },
    {
      id: 'share',
      icon: Share2,
      label: 'Share Track',
      color: 'text-text-primary',
      iconColor: 'text-text-muted group-hover:text-text-primary',
      action: () => handleAction('share')
    },
  ];

  const monetizationActions = [
    {
      id: 'tip',
      icon: Coins,
      label: 'Tip Artist (TON)',
      color: 'text-text-primary',
      iconColor: 'text-amber-400',
      action: () => handleAction('tip')
    },
    {
      id: 'mint',
      icon: Gem,
      label: track.isNFT ? 'View NFT on Market' : 'Mint Track NFT',
      color: 'text-text-primary',
      iconColor: 'text-purple-400',
      action: () => handleAction('mint')
    },
    ...(isArtist ? [{
      id: 'monetize',
      icon: Coins,
      label: 'Configure Monetization',
      color: 'text-text-primary',
      iconColor: 'text-cyan-400',
      action: () => handleAction('monetize')
    }] : []),
  ];

  const managementActions = [
    ...(onRemove ? [{
      id: 'remove',
      icon: Trash2,
      label: 'Remove from List',
      color: 'text-red-400',
      iconColor: 'text-red-400',
      action: () => { onRemove(); onClose(); }
    }] : []),
    {
      id: 'report',
      icon: Flag,
      label: 'Report Track',
      color: 'text-text-muted',
      iconColor: 'text-text-muted group-hover:text-amber-400',
      action: () => handleAction('report')
    }
  ];

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#0d0d10] border-t border-[#c0c0c0]/20 shadow-2xl rounded-t-2xl sm:rounded-2xl max-w-lg mx-auto p-0 overflow-hidden text-text-primary">
        <div className="w-full relative z-10 px-4 pt-3 pb-6 sm:pb-5 max-h-[85vh] flex flex-col">
          {/* Top Handle */}
          <div className="flex justify-center pb-2">
            <div className="w-10 h-1 rounded-full bg-[#c0c0c0]/30" />
          </div>

          {/* Track Header */}
          <DrawerHeader className="p-0 pb-3.5 pt-1 border-b border-[#c0c0c0]/15 flex flex-row items-center gap-3.5 text-left">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-[#c0c0c0]/15">
              <img 
                src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
                className="w-full h-full object-cover" 
                alt={track.title} 
                loading="eager"
              />
            </div>
            
            <div className="flex-1 min-w-0 pr-2">
              <DrawerTitle className="text-base font-bold text-text-primary truncate tracking-tight">
                {track.title}
              </DrawerTitle>
              
              <div className="flex items-center gap-1.5 mt-0.5">
                <DrawerDescription className="text-xs font-medium text-text-muted truncate">
                  {track.artist}
                </DrawerDescription>
                {isVerified && (
                  <BadgeCheck 
                    className="w-3.5 h-3.5 text-blue-400 shrink-0 fill-blue-500/20" 
                    aria-label="Verified Artist" 
                  />
                )}
              </div>

              {/* Badges / Details row */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {track.genre && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-800/80 text-text-muted font-mono">
                    {track.genre}
                  </span>
                )}
                {track.isNFT && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                    NFT {track.price ? `• ${track.price} TON` : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Quick close icon */}
            <DrawerClose asChild>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close track options"
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-zinc-800/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c0c0c0]/50"
              >
                <X className="w-5 h-5" />
              </button>
            </DrawerClose>
          </DrawerHeader>
          
          {/* Scrollable Action List */}
          <div 
            className="flex-1 overflow-y-auto no-scrollbar py-2 divide-y divide-[#c0c0c0]/10 max-h-[52vh]"
            role="menu"
            aria-label="Track actions"
          >
            {/* Primary Actions */}
            <div className="py-1 space-y-0.5">
              {primaryActions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    opt.action();
                  }}
                  aria-label={opt.label}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-zinc-800/50 active:bg-zinc-800/80 transition-colors text-left group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c0c0c0]/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <opt.icon className={cn("h-4.5 w-4.5 shrink-0", opt.iconColor)} />
                    <span className={cn("text-xs sm:text-sm font-medium truncate", opt.color)}>
                      {opt.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted/40 group-hover:text-text-muted transition-colors shrink-0" />
                </button>
              ))}
            </div>

            {/* Detail & Discovery Actions */}
            <div className="py-1 space-y-0.5">
              {detailActions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    opt.action();
                  }}
                  aria-label={opt.label}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-zinc-800/50 active:bg-zinc-800/80 transition-colors text-left group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c0c0c0]/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <opt.icon className={cn("h-4.5 w-4.5 shrink-0", opt.iconColor)} />
                    <span className={cn("text-xs sm:text-sm font-medium truncate", opt.color)}>
                      {opt.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted/40 group-hover:text-text-muted transition-colors shrink-0" />
                </button>
              ))}
            </div>

            {/* Web3 / Monetization Actions */}
            <div className="py-1 space-y-0.5">
              {monetizationActions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    opt.action();
                  }}
                  aria-label={opt.label}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-zinc-800/50 active:bg-zinc-800/80 transition-colors text-left group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c0c0c0]/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <opt.icon className={cn("h-4.5 w-4.5 shrink-0", opt.iconColor)} />
                    <span className={cn("text-xs sm:text-sm font-medium truncate", opt.color)}>
                      {opt.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted/40 group-hover:text-text-muted transition-colors shrink-0" />
                </button>
              ))}
            </div>

            {/* Management Actions */}
            <div className="py-1 space-y-0.5">
              {managementActions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    opt.action();
                  }}
                  aria-label={opt.label}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-zinc-800/50 active:bg-zinc-800/80 transition-colors text-left group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c0c0c0]/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <opt.icon className={cn("h-4.5 w-4.5 shrink-0", opt.iconColor)} />
                    <span className={cn("text-xs sm:text-sm font-medium truncate", opt.color)}>
                      {opt.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted/40 group-hover:text-text-muted transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Cancel Button */}
          <div className="pt-2 mt-1 border-t border-[#c0c0c0]/15">
            <DrawerClose asChild>
              <Button 
                type="button"
                variant="outline"
                onClick={onClose}
                aria-label="Cancel and close options"
                className="w-full rounded-xl h-10 text-xs sm:text-sm font-semibold border-[#c0c0c0]/20 bg-zinc-900/60 hover:bg-zinc-800 text-text-primary transition-colors focus-visible:ring-1 focus-visible:ring-[#c0c0c0]/50"
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
