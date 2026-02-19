import React, { useState, useEffect } from 'react';
import { Track, Artist } from '../types';
import { MOCK_NFTS, TON_LOGO, MOCK_ARTISTS, MOCK_TRACKS } from '../constants';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { findRelatedArtists } from '../services/geminiService';

interface TrackOptionsModalProps {
  track: Track;
  onClose: () => void;
}

const TrackOptionsModal: React.FC<TrackOptionsModalProps> = ({ track, onClose }) => {
  const { 
    addNotification, 
    addToQueue, 
    setTrackToAddToPlaylist, 
    likedTrackIds, 
    toggleLikeTrack, 
    activePlaylistId, 
    removeTrackFromPlaylist 
  } = useAudio();
  const navigate = useNavigate();
  const [isVibeLoading, setIsVibeLoading] = useState(true);
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  
  const isLiked = likedTrackIds.includes(track.id);
  
  // Find associated NFT data if available
  const nftData = MOCK_NFTS.find(n => n.trackId === track.id);
  const currentArtist = MOCK_ARTISTS.find(a => a.id === track.artistId);

  useEffect(() => {
    // Simulate AI Vibe analysis delay
    const timer = setTimeout(() => setIsVibeLoading(false), 1200);
    
    // Fetch related artists based on Sonic DNA
    const fetchRelated = async () => {
      if (!currentArtist) return;
      setIsRelatedLoading(true);
      try {
        const artistTracks = MOCK_TRACKS.filter(t => t.artistId === currentArtist.id);
        const relatedIds = await findRelatedArtists(currentArtist, artistTracks, MOCK_ARTISTS);
        const matches = MOCK_ARTISTS.filter(a => relatedIds.includes(a.id)).slice(0, 3);
        setRelatedArtists(matches);
      } catch (e) {
        const fallback = MOCK_ARTISTS.filter(a => a.id !== currentArtist.id).slice(0, 3);
        setRelatedArtists(fallback);
      } finally {
        setIsRelatedLoading(false);
      }
    };

    fetchRelated();
    return () => clearTimeout(timer);
  }, [track.id, currentArtist]);

  const handleSyncSimilar = () => {
    const vibeQuery = `${track.genre} tracks like ${track.title} by ${track.artist}`;
    navigate(`/discover?search=${encodeURIComponent(vibeQuery)}&vibe=true`);
    addNotification("AI Vibe Sync initialized", "success");
    onClose();
  };

  const handleTip = () => {
    addNotification(`Sending 0.5 TON to ${track.artist}...`, 'info');
    setTimeout(() => {
      addNotification(`Tip confirmed. Protocol updated.`, 'success');
      onClose();
    }, 1500);
  };

  const handleAddToPlaylist = () => {
    setTrackToAddToPlaylist(track);
    onClose();
  };

  const handleRemoveFromPlaylist = () => {
    if (activePlaylistId) {
      removeTrackFromPlaylist(activePlaylistId, track.id);
      addNotification("Frequency purged from sequence", "info");
      onClose();
    }
  };

  const handleToggleLike = () => {
    toggleLikeTrack(track.id);
  };

  const handlePrimaryAction = () => {
    if (nftData) {
      navigate(`/nft/${nftData.id}`);
    } else {
      addNotification("Sync protocol for this frequency is not yet active.", "info");
    }
    onClose();
  };

  const handleArtistClick = (artistId: string) => {
    navigate(`/artist/${artistId}`);
    onClose();
  };

  const shareOptions = [
    { 
      icon: 'fa-link', 
      label: 'Copy Link', 
      color: 'bg-white/5 text-white/40', 
      action: () => { 
        const shareUrl = `${window.location.origin}/nft/${nftData?.id || track.id}`;
        navigator.clipboard.writeText(shareUrl); 
        addNotification('Frequency linked', 'success'); 
      } 
    },
    { 
      icon: 'fa-telegram', 
      label: 'Telegram', 
      color: 'bg-[#0088cc]/10 text-[#0088cc]', 
      action: () => {
        const text = encodeURIComponent(`Check out this track on TonJam: ${track.title} by ${track.artist}`);
        const url = encodeURIComponent(`${window.location.origin}/nft/${nftData?.id || track.id}`);
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
        addNotification('Syncing to Telegram...', 'info');
      } 
    },
    { 
      icon: 'fa-x-twitter', 
      label: 'X (Twitter)', 
      color: 'bg-white/5 text-white', 
      action: () => {
        const text = encodeURIComponent(`Listening to ${track.title} by ${track.artist} on @TonJam_App 🎵 #TON #Web3Music`);
        const url = encodeURIComponent(`${window.location.origin}/nft/${nftData?.id || track.id}`);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        addNotification('Broadcasting to X...', 'info');
      } 
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose}></div>
      
      <div className="relative bg-[#050505] border-t border-white/10 w-full max-h-[96vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-500 rounded-t-[3.5rem] shadow-[0_-30px_100px_rgba(0,0,0,0.9)]">
        <div className="p-8 pb-32 max-w-2xl mx-auto">
          
          <div className="flex justify-center mb-10">
            <div className="w-16 h-1 bg-white/10 rounded-full"></div>
          </div>

          {/* Identity Header */}
          <div className="flex flex-col md:flex-row gap-8 mb-12 items-center md:items-start text-center md:text-left">
            <div className="relative w-32 h-32 md:w-44 md:h-44 flex-shrink-0 group">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl group-hover:bg-blue-500/30 transition-all duration-700"></div>
              <img src={track.coverUrl} className="relative w-full h-full object-cover rounded-[2rem] shadow-2xl border border-white/10 transition-transform duration-700 group-hover:scale-[1.03]" alt="" />
              {track.isNFT && (
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center border-4 border-black shadow-2xl">
                  <i className="fas fa-gem text-xs text-white"></i>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pt-2">
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none mb-4 truncate">{track.title}</h2>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6 cursor-pointer group" onClick={() => handleArtistClick(track.artistId)}>
                <p className="text-lg text-blue-500 uppercase font-black tracking-widest italic group-hover:text-white transition-colors">{track.artist}</p>
                <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                  <i className="fas fa-check text-[8px] text-blue-400"></i>
                </div>
              </div>
              <div className="flex justify-center md:justify-start gap-3">
                <div className="px-5 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Scanner BPM</span>
                  <span className="text-sm font-black text-white italic">{track.bpm || '128'}</span>
                </div>
                <div className="px-5 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Frequency Key</span>
                  <span className="text-sm font-black text-white italic uppercase">{track.key || 'C#m'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Hub - Primary Bolder Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <button 
              onClick={handleTip}
              className="flex items-center justify-center gap-4 py-6 rounded-[1.5rem] bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-white/10 transition-all active:scale-[0.97] group shadow-xl"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 transition-all">
                <i className="fas fa-hand-holding-dollar text-blue-500 text-lg group-hover:text-white"></i>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white italic">Tip Producer</span>
            </button>
            <button 
              onClick={handlePrimaryAction}
              className="flex items-center justify-center gap-4 py-6 rounded-[1.5rem] electric-blue-bg shadow-2xl shadow-blue-500/30 active:scale-[0.97] transition-all text-white border border-white/20"
            >
              {nftData ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
                    <img src={TON_LOGO} className="w-5 h-5 invert" alt="" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Buy {nftData.price} TON</span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
                    <i className="fas fa-plus-circle text-lg"></i>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Mint Edition</span>
                </>
              )}
            </button>
          </div>

          {/* Protocol Menu - Refined Bolder Actions */}
          <div className="space-y-3 mb-16">
            <div className="px-2 mb-4">
              <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] italic">Network Protocols</h3>
            </div>
            
            <MenuAction 
              icon={isLiked ? "fa-heart text-red-500" : "fa-heart"} 
              label={isLiked ? "Saved in Vault" : "Save to Vault"} 
              onClick={handleToggleLike} 
              active={isLiked}
            />
            <MenuAction 
              icon="fa-sparkles" 
              label="Sync Similar Frequencies" 
              color="text-blue-400" 
              onClick={handleSyncSimilar} 
            />
            <MenuAction 
              icon="fa-forward-step" 
              label="Queue Frequency" 
              onClick={() => { addToQueue(track); addNotification('Next in line', 'success'); onClose(); }} 
            />
            <MenuAction 
              icon="fa-layer-group" 
              label="Add to Playlist" 
              onClick={handleAddToPlaylist} 
            />
            {activePlaylistId && (
              <MenuAction 
                icon="fa-trash-can" 
                label="Remove from Sequence" 
                color="text-red-500/60"
                onClick={handleRemoveFromPlaylist} 
              />
            )}
            <MenuAction 
              icon="fa-share-nodes" 
              label="Share Frequency" 
              onClick={() => {
                const element = document.getElementById('social-relay');
                element?.scrollIntoView({ behavior: 'smooth' });
                addNotification('Opening Broadcast Relay', 'info');
              }} 
            />
            <MenuAction 
              icon="fa-user-ninja" 
              label="Artist Neural Hub" 
              onClick={() => { navigate(`/artist/${track.artistId}`); onClose(); }} 
            />
          </div>

          {/* Neural Relay - Sonic Proximity */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <i className="fas fa-dna text-blue-500 text-[10px] animate-pulse"></i>
                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic">Neural Relay: Sonic DNA</h4>
              </div>
              {isRelatedLoading && <i className="fas fa-circle-notch animate-spin text-blue-500 text-[10px]"></i>}
            </div>
            <div className="grid grid-cols-3 gap-6">
              {relatedArtists.length > 0 ? (
                relatedArtists.map((related) => (
                  <div 
                    key={related.id} 
                    onClick={() => handleArtistClick(related.id)}
                    className="flex flex-col items-center gap-4 group cursor-pointer"
                  >
                    <div className="relative">
                      <div className="absolute -inset-2 bg-blue-500/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
                      <img src={related.avatarUrl} className="relative w-24 h-24 rounded-[1.5rem] object-cover border border-white/5 group-hover:border-blue-500/50 transition-all shadow-xl" alt={related.name} />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-black group-hover:scale-110 transition-transform shadow-2xl">
                        <i className="fas fa-bolt text-[8px] text-white"></i>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-white/50 uppercase italic tracking-tighter truncate w-full text-center group-hover:text-blue-400 transition-colors">{related.name}</span>
                  </div>
                ))
              ) : (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-24 h-24 rounded-[1.5rem] bg-white/5 border border-white/5"></div>
                    <div className="w-16 h-2 bg-white/5 rounded-full"></div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Social Relay */}
          <div className="mb-16" id="social-relay">
            <div className="flex items-center gap-6 mb-10">
               <div className="h-px flex-1 bg-white/5"></div>
               <h3 className="text-[9px] font-black text-white/10 uppercase tracking-[0.6em] italic whitespace-nowrap">Global Broadcast</h3>
               <div className="h-px flex-1 bg-white/5"></div>
            </div>
            <div className="flex justify-around items-center">
              {shareOptions.map((option, idx) => (
                <button 
                  key={idx}
                  onClick={option.action}
                  className="flex flex-col items-center gap-4 group flex-1 max-w-[100px]"
                >
                  <div className={`w-16 h-16 rounded-[1.5rem] ${option.color} flex items-center justify-center border border-white/5 shadow-2xl group-hover:scale-110 group-active:scale-90 transition-all duration-300`}>
                    <i className={`fa-brands ${option.icon} text-2xl`}></i>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors text-center">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-7 text-white/30 font-black uppercase text-xs tracking-[0.8em] hover:text-red-500 transition-all italic text-center bg-white/[0.02] rounded-[2rem] border border-white/5 active:bg-red-500/10 active:border-red-500/50"
          >
            ABORT SYNC
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuAction = ({ icon, label, onClick, color = "text-white/40", active = false }: { icon: string, label: string, onClick: () => void, color?: string, active?: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-6 p-5 hover:bg-white/[0.04] rounded-[1.8rem] transition-all group active:scale-[0.98] border border-white/5 ${active ? 'bg-blue-600/5 border-blue-500/30' : 'hover:border-blue-500/30'}`}
  >
    <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center ${active ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' : color + ' bg-white/5 border-white/10'} group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all rounded-2xl border`}>
      <i className={`fas ${icon} text-xl`}></i>
    </div>
    <span className={`text-base font-black uppercase tracking-tighter italic ${active ? 'text-white' : 'text-white/60'} group-hover:text-white transition-colors`}>
      {label}
    </span>
    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
      <i className="fas fa-chevron-right text-[10px] text-blue-500"></i>
    </div>
  </button>
);

export default TrackOptionsModal;