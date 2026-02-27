import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, Headphones, Clock, CheckCircle2, User as UserIcon } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO, MOCK_TRACKS, MOCK_USER, MOCK_ARTISTS } from '@/constants';
import { useAudio } from '@/context/AudioContext';

interface NFTCardProps {
  nft: NFTItem;
  onAction?: (nft: NFTItem) => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, onAction }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, setOptionsTrack } = useAudio();
  const associatedTrack = MOCK_TRACKS.find(t => t.id === nft.trackId);
  const isActive = currentTrack?.id === nft.trackId;
  const isOwner = nft.owner === MOCK_USER.walletAddress;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (associatedTrack) {
      playTrack(associatedTrack);
    }
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (associatedTrack) {
      setOptionsTrack(associatedTrack);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction(nft);
    } else {
      navigate(`/nft/${nft.id}`);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    navigate(`/nft/${nft.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative cursor-pointer group w-full bg-white/5 border border-white/10 rounded-2xl p-3 transition-all hover:bg-white/10 hover:-translate-y-1 overflow-hidden shadow-2xl"
    >
      {/* Artwork Area */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-neutral-900">
        <img
          src={nft.imageUrl}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110"
          alt={nft.title}
        />
        
        {/* Play Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isActive ? 'opacity-100' : ''}`}>
          <button 
            onClick={handlePlayClick} 
            className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center active:scale-90 transition-all shadow-xl shadow-blue-600/40"
          >
            {isActive && isPlaying ? (
              <Pause className="h-6 w-6 text-white fill-white" />
            ) : (
              <Play className="h-6 w-6 text-white fill-white ml-1" />
            )}
          </button>
        </div>

        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
            {nft.edition}
          </span>
        </div>

        <button 
          onClick={handleOptionsClick} 
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/80"
        >
          <MoreVertical className="h-4 w-4 text-white/70" />
        </button>
      </div>

      {/* Info Area */}
      <div className="px-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Headphones className="h-3 w-3 text-blue-500" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {(associatedTrack?.playCount || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-white/40" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {associatedTrack ? `${Math.floor(associatedTrack.duration / 60)}:${String(associatedTrack.duration % 60).padStart(2, '0')}` : '0:00'}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className={`text-sm font-bold uppercase tracking-tight truncate leading-tight flex-1 ${isActive ? 'text-blue-500' : 'text-white'}`}>
              {nft.title}
            </h3>
            {nft.listingType === 'auction' && (
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 shadow-lg shadow-amber-500/50"></div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 truncate">@{nft.creator}</p>
              {MOCK_ARTISTS.find(a => a.name === nft.creator)?.verified && (
                <CheckCircle2 className="h-3 w-3 text-blue-500" />
              )}
            </div>
            {!isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const artist = MOCK_ARTISTS.find(a => a.name === nft.owner);
                  if (artist) navigate(`/artist/${artist.id}`);
                  else if (nft.owner === MOCK_USER.walletAddress) navigate('/profile');
                }}
                className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-bold uppercase tracking-widest text-blue-500/60 hover:text-blue-400 transition-all flex items-center gap-1"
              >
                <UserIcon className="h-2 w-2" /> Owner
              </button>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Current Price</span>
            <div className="flex items-center gap-1.5">
              <img src={TON_LOGO} className="w-4 h-4" alt="TON" />
              <span className="text-base font-bold text-white tracking-tighter">{nft.price}</span>
            </div>
          </div>
          
          <button 
            onClick={handleActionClick} 
            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg
              ${isOwner 
                ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'}
            `}
          >
            {isOwner ? (nft.listingType ? 'Manage' : 'List') : nft.listingType === 'auction' ? 'Bid' : 'Buy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;