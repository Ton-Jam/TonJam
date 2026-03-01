import React, { useEffect, useState, useRef } from 'react';
import { useAudio } from '@/context/AudioContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  ChevronDown, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Volume2,
  VolumeX,
  PlusCircle,
  Gem,
  CheckCircle2,
  ListMusic,
  MessageSquare,
  Music2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ARTISTS } from '@/constants';
import { useNavigate } from 'react-router-dom';

const AudioVisualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { analyser } = useAudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const bars = 32;
    const heights = Array(bars).fill(2);
    const targets = Array(bars).fill(2);
    let phase = 0;

    const dataArray = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;

    const draw = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width / bars;
      phase += 0.05;

      if (analyser && isPlaying && dataArray) {
        analyser.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < bars; i++) {
        if (isPlaying) {
          if (analyser && dataArray) {
            const dataIndex = Math.floor(i * (dataArray.length / bars) * 0.5);
            const value = dataArray[dataIndex] || 0;
            targets[i] = 2 + (value / 255) * (canvas.height * 0.6);
          } else {
            const wave = Math.sin(phase + i * 0.2) * 0.5 + 0.5;
            if (Math.random() > 0.6) {
              targets[i] =
                2 +
                wave * (canvas.height * 0.3) +
                Math.random() * (canvas.height * 0.2);
            }
          }
        } else {
          targets[i] = 2;
        }

        heights[i] += (targets[i] - heights[i]) * 0.2;
        const h = Math.max(2, heights[i]);
        const x = i * width;
        const y = canvas.height - h;

        ctx.fillStyle = "#3b82f6";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#3b82f6";
        ctx.beginPath();
        const barWidth = Math.max(2, width - 3);
        ctx.roundRect(x + (width - barWidth) / 2, y, barWidth, h, [3, 3, 0, 0]);
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, analyser]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-[240px] h-[30px] opacity-80 mix-blend-screen"
    />
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
    isRepeat,
    toggleRepeat,
    toggleLikeTrack,
    likedTrackIds,
    queue,
    playTrack,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    userProfile
  } = useAudio();

  const [activeView, setActiveView] = useState<'player' | 'lyrics' | 'comments'>('player');
  const [showQueue, setShowQueue] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const duration = currentTrack.duration || 0;
  const currentTime = (progress / 100) * duration;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    seek(newProgress);
  };

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const artistData = MOCK_ARTISTS.find(a => a.id === currentTrack.artistId);

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[60] bg-[#060c1a] overflow-y-auto no-scrollbar"
      ref={containerRef}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#060c1a] border-b border-white/5">
        <button 
          onClick={() => setFullPlayerOpen(false)}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-all"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1">Now Playing</p>
          <div className="flex gap-2 bg-white/5 p-1 rounded-full">
            <button 
              onClick={() => setActiveView('player')}
              className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${activeView === 'player' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
              Player
            </button>
            <button 
              onClick={() => setActiveView('lyrics')}
              className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${activeView === 'lyrics' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
              Lyrics
            </button>
            <button 
              onClick={() => setActiveView('comments')}
              className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${activeView === 'comments' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
              Feed
            </button>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-all">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="max-w-xl mx-auto px-8 pb-32">
        {/* Main Player Section */}
        <div className="flex flex-col items-center pt-8 mb-12">
          {/* Content Switcher */}
          <div className="w-full mb-12 min-h-[400px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {activeView === 'player' && (
                <motion.div 
                  key="player"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Album Art */}
                  <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] mb-8 relative group">
                    <img 
                      src={currentTrack.coverUrl} 
                      alt={currentTrack.title} 
                      className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                  <AudioVisualizer isPlaying={isPlaying} />
                </motion.div>
              )}

              {activeView === 'lyrics' && (
                <motion.div 
                  key="lyrics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full h-[400px] overflow-y-auto no-scrollbar py-10 px-4 space-y-8 text-center"
                >
                  <p className="text-2xl font-bold text-white uppercase tracking-tighter leading-tight">
                    Frequencies locked, we're forging the soul
                  </p>
                  <p className="text-2xl font-bold text-blue-400 uppercase tracking-tighter leading-tight">
                    Digital diamonds in a decentralized bowl
                  </p>
                  <p className="text-2xl font-bold text-white/40 uppercase tracking-tighter leading-tight">
                    TON blockchain rhythm, heart under control
                  </p>
                  <p className="text-2xl font-bold text-white/20 uppercase tracking-tighter leading-tight">
                    Decentralized beats, we're taking the toll
                  </p>
                </motion.div>
              )}

              {activeView === 'comments' && (
                <motion.div 
                  key="comments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full h-[400px] overflow-y-auto no-scrollbar py-6 space-y-6"
                >
                  <div className="flex gap-4 mb-8">
                    <img src={userProfile.avatar} className="w-10 h-10 rounded-full" alt="" />
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        placeholder="Broadcast your thoughts..." 
                        className="w-full bg-white/5 rounded-xl py-3 px-5 text-sm text-white outline-none border border-white/5 focus:border-blue-500/50 transition-all"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-[10px] font-bold uppercase tracking-widest">Post</button>
                    </div>
                  </div>
                  {[
                    { id: 1, user: "Neon Voyager", avatar: "https://picsum.photos/100/100?random=21", text: "This track is absolutely mind-blowing! The bass is perfect.", time: "2h ago" },
                    { id: 2, user: "Sarah Jenkins", avatar: "https://picsum.photos/100/100?random=32", text: "Love the atmospheric vibes here. Great work!", time: "5h ago" },
                    { id: 3, user: "CryptoPioneer", avatar: "https://picsum.photos/100/100?random=50", text: "Added this immediately. A future classic.", time: "1d ago" },
                  ].map(comment => (
                    <div key={comment.id} className="flex gap-4 group">
                      <img src={comment.avatar} className="w-10 h-10 rounded-full" alt="" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white uppercase tracking-tight">{comment.user}</span>
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{comment.time}</span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Track Info */}
          <div className="w-full flex items-center justify-between mb-10">
            <div className="min-w-0">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter uppercase truncate mb-2">{currentTrack.title}</h2>
              <button 
                onClick={() => {
                  setFullPlayerOpen(false);
                  navigate(`/artist/${currentTrack.artistId}`);
                }}
                className="text-lg text-blue-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                {currentTrack.artist}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleLikeTrack(currentTrack.id)}
                className={`p-3 rounded-full transition-all ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-white/20 hover:text-white bg-white/5'}`}
              >
                <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full mb-10 group">
            <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-3">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={progress || 0}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full flex items-center justify-between mb-12">
            <button 
              onClick={toggleShuffle}
              className={`p-3 rounded-full transition-all ${isShuffle ? 'text-blue-400 bg-blue-400/10' : 'text-white/20 hover:text-white'}`}
            >
              <Shuffle className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-8">
              <button 
                onClick={prevTrack}
                className="p-2 text-white/60 hover:text-white transition-all active:scale-90"
              >
                <SkipBack className="h-8 w-8 fill-current" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-600/40 text-white"
              >
                {isPlaying ? (
                  <Pause className="h-10 w-10 fill-current" />
                ) : (
                  <Play className="h-10 w-10 fill-current ml-1" />
                )}
              </button>
              
              <button 
                onClick={nextTrack}
                className="p-2 text-white/60 hover:text-white transition-all active:scale-90"
              >
                <SkipForward className="h-8 w-8 fill-current" />
              </button>
            </div>
            
            <button 
              onClick={toggleRepeat}
              className={`p-3 rounded-full transition-all ${isRepeat ? 'text-blue-400 bg-blue-400/10' : 'text-white/20 hover:text-white'}`}
            >
              <Repeat className="h-5 w-5" />
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="w-full grid grid-cols-4 gap-4 mb-12">
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                <PlusCircle className="h-5 w-5" />
              </div>
              <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40">Add</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-amber-500/20 group-hover:text-amber-500 transition-all">
                <Gem className="h-5 w-5" />
              </div>
              <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40">Mint</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                <Share2 className="h-5 w-5" />
              </div>
              <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40">Share</span>
            </button>
            <button 
              onClick={() => setShowQueue(!showQueue)}
              className={`flex flex-col items-center gap-2 group ${showQueue ? 'text-blue-500' : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${showQueue ? 'bg-blue-500/20 text-blue-500' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'}`}>
                <ListMusic className="h-5 w-5" />
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-widest ${showQueue ? 'text-blue-500' : 'text-white/20 group-hover:text-white/40'}`}>Queue</span>
            </button>
          </div>

          {/* Volume Control */}
          <div className="w-full max-w-sm flex items-center gap-4 px-4 py-3 bg-white/5 rounded-2xl">
            <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <div className="flex-1 relative h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-white/40 transition-all"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>
        </div>

        {/* Up Next / Queue Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-bold text-white/40 uppercase tracking-[0.4em]">Up Next</h3>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{queue.length} Tracks in Queue</span>
          </div>

          <div className="space-y-3">
            {queue.slice(queue.findIndex(t => t.id === currentTrack.id) + 1, queue.findIndex(t => t.id === currentTrack.id) + 6).map((track, i) => (
              <button 
                key={track.id}
                onClick={() => playTrack(track)}
                className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-4 w-4 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-bold text-white uppercase truncate mb-1">{track.title}</p>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">{track.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-white/20">{track.duration ? formatTime(track.duration) : '3:45'}</p>
                </div>
              </button>
            ))}
            {queue.length <= 1 && (
              <div className="py-12 text-center bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Queue is empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Artist Dossier */}
        <div className="mt-20 pt-20 border-t border-white/5">
          <h3 className="text-[12px] font-bold text-white/40 uppercase tracking-[0.4em] mb-8">Artist Dossier</h3>
          <div className="bg-[#0a192f] p-8 rounded-2xl border border-blue-500/10">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <img 
                  src={artistData?.avatarUrl || `https://picsum.photos/200/200?seed=${currentTrack.artist}`} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-500/20" 
                  alt="" 
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#0a192f] rounded-full flex items-center justify-center border border-blue-500/20">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white uppercase tracking-tighter mb-1">{currentTrack.artist}</h4>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{artistData?.followers.toLocaleString() || '12.4K'} Followers</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed italic mb-8">
              "{artistData?.bio || "Digital pioneer forging new sonic landscapes in the TON ecosystem. Exploring the boundaries between rhythm and decentralized protocols."}"
            </p>
            <button 
              onClick={() => {
                setFullPlayerOpen(false);
                navigate(`/artist/${currentTrack.artistId}`);
              }}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10"
            >
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FullPlayer;
