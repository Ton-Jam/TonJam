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
  ChevronRight, 
  X,
  ArrowLeft,
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
      color: 'text-white',
      iconColor: isCurrentPlaying ? 'text-[#00B4D8]' : 'text-zinc-400 group-hover:text-[#00B4D8]',
      action: () => handleAction('playback')
    },
    {
      id: 'queue',
      icon: ListMusic,
      label: 'Add to Queue',
      color: 'text-white',
      iconColor: 'text-zinc-400 group-hover:text-white',
      action: () => handleAction('queue')
    },
    {
      id: 'playlist',
      icon: Plus,
      label: 'Add to Playlist',
      color: 'text-white',
      iconColor: 'text-zinc-400 group-hover:text-white',
      action: () => handleAction('playlist')
    },
    {
      id: 'like',
      icon: Heart,
      label: isLiked ? 'Remove from Liked' : 'Like Track',
      color: isLiked ? 'text-red-400' : 'text-white',
      iconColor: isLiked ? 'text-red-500 fill-current' : 'text-zinc-400 group-hover:text-red-400',
      action: () => handleAction('like')
    },
  ];

  const detailActions = [
    {
      id: 'details',
      icon: Info,
      label: 'View Track Details',
      color: 'text-white',
      iconColor: 'text-zinc-400 group-hover:text-white',
      action: () => handleAction('details')
    },
    {
      id: 'artist',
      icon: User,
      label: `View Artist (${track.artist})`,
      color: 'text-white',
      iconColor: 'text-zinc-400 group-hover:text-white',
      action: () => handleAction('artist')
    },
    {
      id: 'share',
      icon: Share2,
      label: 'Share Track',
      color: 'text-white',
      iconColor: 'text-zinc-400 group-hover:text-white',
      action: () => handleAction('share')
    },
  ];

  const monetizationActions = [
    {
      id: 'tip',
      icon: Coins,
      label: 'Tip Artist (TON)',
      color: 'text-white',
      iconColor: 'text-amber-400',
      action: () => handleAction('tip')
    },
    {
      id: 'mint',
      icon: Gem,
      label: track.isNFT ? 'View on NFT Marketplace' : 'Mint Track as Music NFT',
      color: 'text-white',
      iconColor: 'text-purple-400',
      action: () => handleAction('mint')
    },
    ...(isArtist ? [{
      id: 'monetize',
      icon: Coins,
      label: 'Configure Monetization',
      color: 'text-white',
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
      color: 'text-zinc-400',
      iconColor: 'text-zinc-400 group-hover:text-amber-400',
      action: () => handleAction('report')
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] bg-[#07111F] text-white flex flex-col overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Track options screen"
    >
      {/* Ambient background glow without border lines */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-[#00B4D8]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Screen Top Header Bar - Clean and borderless */}
      <div className="sticky top-0 z-20 bg-[#07111F]/95 backdrop-blur-xl px-4 sm:px-6 py-3.5 flex items-center justify-between border-none">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close track options"
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-all text-xs font-semibold cursor-pointer border-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-sm font-bold text-white uppercase tracking-wider font-['Poppins',sans-serif]">
          Track Options
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer border-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-4 space-y-4 pb-[calc(env(safe-area-inset-bottom,16px)+32px)]">
        {/* Track Hero Banner - Compact horizontal card with reduced title fitting mobile screens cleanly */}
        <div className="flex flex-row items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-[#0A1628] shadow-lg">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0 shadow-md">
            <img 
              src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
              className="w-full h-full object-cover" 
              alt={track.title} 
              loading="eager"
            />
          </div>
          
          <div className="flex-1 min-w-0 space-y-0.5 text-left">
            {/* Reduced track title for mobile viewport */}
            <h1 className="text-sm sm:text-base font-bold text-white truncate tracking-tight">
              {track.title}
            </h1>
            
            <div className="flex items-center gap-1.5">
              <p className="text-xs sm:text-sm font-medium text-[#C2C7CD] truncate">
                {track.artist}
              </p>
              {isVerified && (
                <BadgeCheck 
                  className="w-3.5 h-3.5 text-[#00B4D8] shrink-0 fill-[#00B4D8]/20" 
                  aria-label="Verified Artist" 
                />
              )}
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
              {track.genre && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-[#C2C7CD] font-mono">
                  {track.genre}
                </span>
              )}
              {track.isNFT && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300">
                  NFT {track.price ? `• ${track.price} TON` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Groups with borderless design */}
        <div className="space-y-3" role="menu" aria-label="Track actions">
          {/* Primary Actions Group */}
          <div className="rounded-2xl bg-[#0A1628] p-1.5 space-y-0.5 border-none">
            {primaryActions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  opt.action();
                }}
                aria-label={opt.label}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-white/[0.07] active:bg-white/[0.1] transition-colors text-left group cursor-pointer border-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <opt.icon className={cn("h-4.5 w-4.5 shrink-0", opt.iconColor)} />
                  <span className={cn("text-xs sm:text-sm font-medium truncate font-['Poppins',sans-serif]", opt.color)}>
                    {opt.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
              </button>
            ))}
          </div>

          {/* Details & Social Group */}
          <div className="rounded-2xl bg-[#0A1628] p-1.5 space-y-0.5 border-none">
            {detailActions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  opt.action();
                }}
                aria-label={opt.label}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-white/[0.07] active:bg-white/[0.1] transition-colors text-left group cursor-pointer border-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <opt.icon className={cn("h-4.5 w-4.5 shrink-0", opt.iconColor)} />
                  <span className={cn("text-xs sm:text-sm font-medium truncate font-['Poppins',sans-serif]", opt.color)}>
                    {opt.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
              </button>
            ))}
          </div>

          {/* Web3 / Monetization Group */}
          <div className="rounded-2xl bg-[#0A1628] p-1.5 space-y-0.5 border-none">
            {monetizationActions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  opt.action();
                }}
                aria-label={opt.label}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-white/[0.07] active:bg-white/[0.1] transition-colors text-left group cursor-pointer border-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <opt.icon className={cn("h-4.5 w-4.5 shrink-0", opt.iconColor)} />
                  <span className={cn("text-xs sm:text-sm font-medium truncate font-['Poppins',sans-serif]", opt.color)}>
                    {opt.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
              </button>
            ))}
          </div>

          {/* Management Actions */}
          <div className="rounded-2xl bg-[#0A1628] p-1.5 space-y-0.5 border-none">
            {managementActions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  opt.action();
                }}
                aria-label={opt.label}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-white/[0.07] active:bg-white/[0.1] transition-colors text-left group cursor-pointer border-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <opt.icon className={cn("h-4.5 w-4.5 shrink-0", opt.iconColor)} />
                  <span className={cn("text-xs sm:text-sm font-medium truncate font-['Poppins',sans-serif]", opt.color)}>
                    {opt.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Done / Cancel CTA */}
        <div className="pt-2">
          <Button 
            type="button"
            onClick={onClose}
            aria-label="Cancel and close options"
            className="w-full rounded-2xl h-11 text-xs sm:text-sm font-bold bg-white/[0.08] hover:bg-white/[0.14] text-white transition-all cursor-pointer border-none"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrackOptionsModal;
