import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAudio } from '@/context/AudioContext';
import { 
  Heart, 
  Share2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat as RepeatIcon, 
  Shuffle as ShuffleIcon,
  Volume2,
  List,
  MoreVertical,
  ChevronDown,
  Info,
  MessageSquare,
  Music,
  Send,
  PlusCircle,
  Hash,
  Clock,
  ExternalLink,
  CheckCircle2,
  Mic2
} from "lucide-react";
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ARTISTS, MOCK_TRACKS } from '@/constants';
import { useNavigate } from 'react-router-dom';
import { getPlaceholderImage } from '@/lib/utils';

const LyricsView: React.FC<{ lyrics: string }> = ({ lyrics }) => {
  const lines = lyrics.split('\n');

  return (
    <div className="w-full h-[400px] overflow-y-auto no-scrollbar py-2 px-2 space-y-4 text-left mask-image-gradient">
      {lines.map((line, i) => (
        <motion.p 
          key={`${line.substring(0, 10)}-${i}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="text-lg md:text-2xl font-black tracking-tight leading-tight text-white/40 hover:text-white transition-colors cursor-default"
        >
          {line || <br />}
        </motion.p>
      ))}
    </div>
  );
};

const FullPlayer: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    progress, 
    seek, 
    isFullPlayerOpen, 
    setFullPlayerOpen,
    nextTrack,
    prevTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    toggleLikeTrack,
    likedTrackIds,
    queue,
    playTrack,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    userProfile,
    addNotification,
    allTracks,
    setTrackToAddToPlaylist,
    updateTrack
  } = useAudio();

  const [activeView, setActiveView] = useState<'player' | 'lyrics' | 'comments' | 'artist'>('player');
  const [showQueue, setShowQueue] = useState(false);
  const [comment, setComment] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Waveform logic
  const waveformHeights = useMemo(() => {
    return Array.from({ length: 60 }, () => Math.random() * 80 + 20);
  }, []);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedProgress = (x / rect.width) * 100;
    seek(clickedProgress);
  };

  if (!isFullPlayerOpen || !currentTrack) return null;

  const duration = currentTrack.duration || 0;
  const currentTime = (progress / 100) * duration;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const artistData = MOCK_ARTISTS.find(a => a.uid === currentTrack.artistId);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#/track/${currentTrack.id}`;
    if (navigator.share) {
      await navigator.share({
        title: currentTrack.title,
        text: `Listening to ${currentTrack.title} on TonJam`,
        url: shareUrl
      }).catch(console.error);
    } else {
      await navigator.clipboard.writeText(shareUrl);
      addNotification('Link copied!', 'success');
    }
  };

  const handlePostComment = () => {
    if (!comment.trim()) return;
    addNotification("Comment posted", "success");
    setComment("");
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-[#0B0F14] text-white overflow-y-auto no-scrollbar"
      ref={containerRef}
    >
      {/* Background Ambience */}
      <div 
        className="fixed inset-0 z-0 opacity-20 blur-[150px] scale-150 pointer-events-none"
        style={{
          backgroundImage: `url(${currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-4 pb-32 max-w-lg mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setFullPlayerOpen(false)}
            className="p-2 -ml-2 text-white/50 hover:text-white transition-all flex items-center gap-2"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Now Streaming</p>
            <p className="text-[11px] font-black uppercase tracking-widest text-blue-500">TonJam Network</p>
          </div>
          <button className="p-2 -mr-2 text-white/50 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Views Switcher */}
        <div className="flex justify-center gap-8 mb-10">
          {[
            { id: 'player', icon: Music, label: 'Player' },
            { id: 'lyrics', icon: Mic2, label: 'Lyrics' },
            { id: 'comments', icon: MessageSquare, label: 'Feed' },
            { id: 'artist', icon: Hash, label: 'Info' }
          ].map((view) => (
            <button 
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`flex flex-col items-center gap-2 transition-all ${activeView === view.id ? 'text-blue-500 scale-110' : 'text-white/30 hover:text-white/60'}`}
            >
              <view.icon className="w-4 h-4" />
              <span className="text-[8px] font-black uppercase tracking-widest">{view.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeView === 'player' && (
            <motion.div 
              key="player-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10"
            >
              {/* Cover Art */}
              <div className="relative aspect-square">
                <div className="absolute inset-0 bg-blue-500/10 rounded-[2.5rem] blur-3xl -z-10 animate-pulse"></div>
                <img
                  src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)}
                  className="w-full h-full object-cover rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.7)] border border-white/5"
                  alt={currentTrack.title}
                />
              </div>

              {/* Info & Like */}
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <h1 className="text-3xl font-black uppercase tracking-tight truncate mb-1">
                    {currentTrack.title}
                  </h1>
                  <p className="text-lg font-bold text-blue-500 uppercase tracking-widest">
                    {currentTrack.artist}
                  </p>
                </div>
                <button 
                  onClick={() => toggleLikeTrack(currentTrack.id)}
                  className={`p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/5 transition-all active:scale-90 ${isLiked ? 'text-blue-500 animate-pulse' : 'text-white/30'}`}
                >
                  <Heart className={`w-8 h-8 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Waveform Progress Profile */}
              <div>
                <div 
                  className="h-16 flex items-end gap-[3px] cursor-pointer relative"
                  onClick={handleWaveformClick}
                >
                  {waveformHeights.map((height, i) => {
                    const barProgress = (i / waveformHeights.length) * 100;
                    const isActive = barProgress <= progress;
                    return (
                      <div 
                        key={i}
                        className="flex-1 rounded-t-sm transition-all duration-300"
                        style={{ 
                          height: `${height}%`,
                          backgroundColor: isActive ? '#3b82f6' : 'rgba(255,255,255,0.8)'
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/20 mt-4 px-1">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-blue-500/60 font-mono italic">Signal Strength: Optimal</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-10">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={toggleShuffle}
                    className={`p-2 transition-all ${isShuffle ? 'text-blue-500' : 'text-white/20 hover:text-white'}`}
                  >
                    <ShuffleIcon className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-8">
                    <button onClick={prevTrack} className="p-2 text-white/80 hover:text-white active:scale-90 transition-all">
                      <SkipBack className="w-10 h-10 fill-current" />
                    </button>
                    
                    <button
                      onClick={togglePlay}
                      className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(37,99,235,0.4)]"
                    >
                      {isPlaying ? (
                        <Pause className="w-10 h-10 text-white fill-white" />
                      ) : (
                        <Play className="w-10 h-10 text-white fill-white ml-1.5" />
                      )}
                    </button>

                    <button onClick={nextTrack} className="p-2 text-white/80 hover:text-white active:scale-90 transition-all">
                      <SkipForward className="w-10 h-10 fill-current" />
                    </button>
                  </div>

                  <button 
                    onClick={toggleRepeat}
                    className={`p-2 transition-all relative ${repeatMode !== 'off' ? 'text-blue-500' : 'text-white/20 hover:text-white'}`}
                  >
                    <RepeatIcon className="w-5 h-5" />
                    {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-black bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">1</span>}
                  </button>
                </div>

                {/* Bottom Tools */}
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                  <Volume2 className="w-4 h-4 text-white/30" />
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="h-4 w-[1px] bg-white/10" />
                  <button onClick={() => setShowQueue(true)} className="p-2 text-white/30 hover:text-white">
                    <List className="w-4 h-4" />
                  </button>
                  <button onClick={handleShare} className="p-2 text-white/30 hover:text-white">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'lyrics' && (
            <motion.div 
              key="lyrics-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1"
            >
              {currentTrack.lyrics ? (
                <LyricsView lyrics={currentTrack.lyrics} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                  <div className="p-6 rounded-full bg-white/5 border border-white/5">
                    <Mic2 className="w-12 h-12 text-white/20" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-white/30">No neural lyrics found for this frequency</p>
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'comments' && (
            <motion.div 
              key="comments-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="relative">
                <input 
                  type="text" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Inject neural comment..."
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-6 pr-16 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                />
                <button 
                  onClick={handlePostComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-[2rem] bg-white/[0.02] border border-white/5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent flex-shrink-0 flex items-center justify-center border border-white/5">
                      <Hash className="w-5 h-5 text-blue-500/30" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Node_X{i}9</span>
                        <span className="text-[8px] font-bold text-white/20">2.{i}h ago</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed font-bold">
                        {i === 1 ? "The sonic texture here is unparalleled." : i === 2 ? "Minted this frequency. Essential transmission." : "Relaying to local subnet. Outstanding vibration."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeView === 'artist' && (
            <motion.div 
              key="artist-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {artistData && (
                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center gap-6">
                    <img 
                      src={artistData.avatarUrl || getPlaceholderImage(`artist-${artistData.uid}`)} 
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-600/20 shadow-2xl" 
                      alt="" 
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-2xl font-black uppercase italic tracking-tight">{artistData.name}</h4>
                        {artistData.verified && <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500/10" />}
                      </div>
                      <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">{artistData.followers?.toLocaleString()} Verified Listeners</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed font-medium">
                    {artistData.bio || "No biography data available in this region of the network."}
                  </p>
                  <button 
                    onClick={() => {
                      setFullPlayerOpen(false);
                      navigate(`/artist/${artistData.uid}`);
                    }}
                    className="w-full py-4 rounded-3xl bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2"
                  >
                    Enter Artist Domain <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-500/40" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Release</p>
                  </div>
                  <p className="font-black italic uppercase tracking-tighter text-lg">{currentTrack.releaseDate ? new Date(currentTrack.releaseDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'MAR 2024'}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-blue-500/40" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Network ID</p>
                  </div>
                  <p className="font-black italic uppercase tracking-tighter text-lg">TJ-{currentTrack.id.slice(-4).toUpperCase()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Queue Overlay */}
      <AnimatePresence>
        {showQueue && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-[70] bg-[#0B0F14]/95 backdrop-blur-3xl flex flex-col pt-10"
          >
            <div className="flex items-center justify-between p-6 mb-4">
              <h3 className="text-2xl font-black uppercase italic tracking-tight underline decoration-blue-500 decoration-4 underline-offset-8">Transmission Queue</h3>
              <button 
                onClick={() => setShowQueue(false)}
                className="p-3 rounded-full bg-white/5 text-white/50"
              >
                <ChevronDown className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-20">
              <div className="p-6 rounded-[2.5rem] bg-blue-500/10 border border-blue-500/20 flex items-center gap-4">
                <img src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)} className="w-16 h-16 rounded-2xl" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black uppercase italic text-blue-500 truncate">{currentTrack.title}</p>
                  <p className="text-xs font-bold text-blue-400/60 uppercase tracking-widest">{currentTrack.artist}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] mb-4">Upcoming Signals</p>
                {queue.map((track, i) => (
                  <div 
                    key={`${track.id}-${i}`} 
                    onClick={() => { playTrack(track); setShowQueue(false); }}
                    className="flex items-center gap-4 p-4 rounded-[1.5rem] hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/5"
                  >
                    <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-12 h-12 rounded-xl" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black uppercase tracking-tight truncate group-hover:text-blue-500 transition-colors">{track.title}</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FullPlayer;
