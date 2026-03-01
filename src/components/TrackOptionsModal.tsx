import React, { useState } from 'react';
import { ListMusic, Plus, Coins, Share2, Network, Gem, Trash2 } from 'lucide-react';
import { Track, Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { MOCK_ARTISTS, APP_LOGO } from '@/constants';
import { analyzeRelatedArtists } from '@/services/geminiService';
import MintModal from './MintModal';

interface TrackOptionsModalProps {
  track: Track;
  onClose: () => void;
  onRemove?: () => void;
}

const TrackOptionsModal: React.FC<TrackOptionsModalProps> = ({ track, onClose, onRemove }) => {
  const { addNotification, addToQueue, setTrackToAddToPlaylist, playlists } = useAudio();
  const [showMintModal, setShowMintModal] = useState(false);
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const handleAction = async (action: string) => {
    switch (action) {
      case 'queue':
        addToQueue(track);
        onClose();
        break;
      case 'playlist':
        setTrackToAddToPlaylist(track);
        onClose();
        break;
      case 'tip':
        addNotification(`Tip protocol initiated for ${track.artist}`, 'success');
        onClose();
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: track.title,
            text: `Check out ${track.title} by ${track.artist} on TonJam!`,
            url: window.location.href
          }).catch(console.error);
        } else {
          navigator.clipboard.writeText(window.location.href);
          addNotification('Track link copied to neural buffer', 'success');
        }
        onClose();
        break;
      case 'related':
        setLoadingRelated(true);
        try {
          const related = await analyzeRelatedArtists(track.artist, track.genre);
          setRelatedArtists(related);
        } catch (err) {
          console.error('Failed to fetch related artists:', err);
          addNotification('Neural analysis failed', 'error');
        } finally {
          setLoadingRelated(false);
        }
        break;
      case 'mint':
        setShowMintModal(true);
        break;
    }
  };

  if (showMintModal) {
    return <MintModal track={track} onClose={() => { setShowMintModal(false); onClose(); }} />;
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0  backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative glass w-full max-w-sm rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 -b -white/5 flex items-center gap-4">
          <img src={track.coverUrl} className="w-16 h-16 rounded-[10px] object-cover shadow-lg" alt="" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[200px]">{track.title}</h3>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{track.artist}</p>
          </div>
        </div>
        <div className="p-2 space-y-1">
          <button onClick={() => handleAction('queue')} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-blue-400 transition-colors">
              <ListMusic className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Add to Queue</span>
          </button>
          <button onClick={() => handleAction('playlist')} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-blue-400 transition-colors">
              <Plus className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Add to Playlist</span>
          </button>
          <button onClick={() => handleAction('tip')} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-emerald-400 transition-colors">
              <Coins className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Tip Producer</span>
          </button>
          <button onClick={() => handleAction('share')} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-blue-400 transition-colors">
              <Share2 className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Share Track</span>
          </button>
          <button onClick={() => handleAction('related')} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-purple-400 transition-colors">
              <Network className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Related Artists (AI)</span>
          </button>
          <button onClick={() => handleAction('mint')} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-blue-600/10 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
              <Gem className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Mint as NFT</span>
          </button>
          {onRemove && (
            <button onClick={() => { onRemove(); onClose(); }} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-red-500/10 transition-all text-left group">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500/40 group-hover:text-red-500 transition-colors">
                <Trash2 className="h-3 w-3" />
              </div>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Remove from Playlist</span>
            </button>
          )}
        </div>
        {relatedArtists.length > 0 && (
          <div className="p-6 bg-white/5 animate-in slide-in-from-bottom duration-300">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-4">Neural Connections</h4>
            <div className="space-y-3">
              {relatedArtists.map(artist => (
                <div key={artist.id} className="flex items-center gap-3">
                  <img src={artist.avatarUrl} className="w-8 h-8 rounded-full" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white uppercase truncate">{artist.name}</p>
                    <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">{artist.genre}</p>
                  </div>
                  <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-[8px] font-bold uppercase tracking-widest text-white transition-all">Follow</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {loadingRelated && (
          <div className="p-8 flex flex-col items-center gap-3">
            <img src={APP_LOGO} className="w-6 h-6 object-contain animate-[spin_3s_linear_infinite] opacity-80" alt="Loading..." />
            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Analyzing Sonic DNA...</p>
          </div>
        )}
        <button onClick={onClose} className="w-full p-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] hover:text-white transition-colors bg-white/5">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TrackOptionsModal;

