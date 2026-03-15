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
  Music2,
  Mic2
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
    const bars = 64; // Increased resolution
    const heights = Array(bars).fill(0);
    const targets = Array(bars).fill(0);
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

      // Center-out visualization
      const centerX = canvas.width / 2;

      for (let i = 0; i < bars; i++) {
        if (isPlaying) {
          if (analyser && dataArray) {
            // Map to frequency data, focusing on bass/mids
            const dataIndex = Math.floor(i * (dataArray.length / bars) * 0.8);
            const value = dataArray[dataIndex] || 0;
            targets[i] = 4 + (value / 255) * (canvas.height * 0.8);
          } else {
            // Fallback animation
            const wave = Math.sin(phase + i * 0.15) * 0.5 + 0.5;
            if (Math.random() > 0.5) {
               targets[i] = 4 + wave * (canvas.height * 0.4) + Math.random() * (canvas.height * 0.3);
            }
          }
        } else {
          targets[i] = 4;
        }

        // Smooth interpolation
        heights[i] += (targets[i] - heights[i]) * 0.15;
        
        const h = Math.max(4, heights[i]);
        
        // Draw mirrored bars from center
        const xOffset = i * width;
        
        // Gradient fill
        const gradient = ctx.createLinearGradient(0, canvas.height - h, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(96, 165, 250, 0.8)'); // blue-400
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.2)'); // blue-600

        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Rounded caps
        const barWidth = Math.max(2, width - 2);
        const x = i * width;
        const y = canvas.height - h;
        
        ctx.roundRect(x + (width - barWidth) / 2, y, barWidth, h, [4, 4, 0, 0]);
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
      className="w-full h-[40px] opacity-60 mix-blend-screen mt-2"
    />
  );
};

const LyricsView: React.FC<{ trackId: string }> = ({ trackId }) => {
  // Mock lyrics with timing
  const lyrics = [
    { time: 0, text: "Frequencies locked, we're forging the soul" },
    { time: 4, text: "Digital diamonds in a decentralized bowl" },
    { time: 8, text: "TON blockchain rhythm, heart under control" },
    { time: 12, text: "Decentralized beats, we're taking the toll" },
    { time: 16, text: "..." },
    { time: 20, text: "Circuit board veins, electric desire" },
    { time: 24, text: "Setting the metaverse completely on fire" },
    { time: 28, text: "No intermediaries, we're taking it higher" },
    { time: 32, text: "The future of music, the ultimate choir" },
  ];

  return (
    <div className="w-full h-[400px] overflow-y-auto no-scrollbar py-10 px-4 space-y-8 text-left mask-image-gradient">
      {lyrics.map((line, i) => (
        <motion.p 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`text-2xl md:text-3xl font-bold tracking-tight leading-tight ${i === 1 ? 'text-foreground' : 'text-muted-foreground/50 hover:text-foreground transition-colors'}`}
        >
          {line.text}
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
    userProfile,
    addNotification,
    allTracks
  } = useAudio();

  const [activeView, setActiveView] = useState<'player' | 'lyrics' | 'comments' | 'artist' | 'playlist'>('player');
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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#/track/${currentTrack.id}`;
    const shareData = {
      title: `${currentTrack.title} by ${currentTrack.artist}`,
      text: `Check out this track on TonJam: ${currentTrack.title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        addNotification('Shared successfully!', 'success');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        addNotification('Link copied to clipboard!', 'success');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        addNotification('Failed to share track.', 'error');
      }
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto no-scrollbar"
      ref={containerRef}
    >
      {/* Dynamic Blurred Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40 blur-[100px] scale-150 pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `url(${currentTrack.coverUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-full">
        {/* Header */}
        <div className="relative top-0 flex items-center justify-between p-6 pt-8">
          <button 
            onClick={() => setFullPlayerOpen(false)}
            className="p-2 -ml-2 text-foreground/80 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
            aria-label="Close full player"
          >
            <ChevronDown className="h-8 w-8" />
          </button>
          <div className="text-center flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50">Now Playing from</span>
            <span className="text-xs font-bold text-foreground tracking-tight mt-0.5">TonJam Network</span>
          </div>
          <button 
            className="p-2 -mr-2 text-foreground/80 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
            aria-label="More options"
          >
            <MoreHorizontal className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-8 max-w-md mx-auto w-full">
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeView === 'player' && (
                <motion.div 
                  key="player"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col"
                >
                  {/* Album Art */}
                  <div className="w-full aspect-square rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 relative group">
                    <img 
                      src={currentTrack.coverUrl} 
                      alt={currentTrack.title} 
                      className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear ${isPlaying ? 'scale-105' : 'scale-100'}`}
                    />
                  </div>
                  
                  {/* Track Info & Like Button */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="min-w-0 flex-1 pr-4 flex items-center gap-3">
                      {artistData && (
                        <img 
                          src={artistData.avatarUrl} 
                          alt={currentTrack.artist} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-background shadow-md"
                        />
                      )}
                      <div className="min-w-0">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight truncate mb-0.5">
                          {currentTrack.title}
                        </h2>
                        <button 
                          onClick={() => {
                            setFullPlayerOpen(false);
                            navigate(`/artist/${currentTrack.artistId}`);
                          }}
                          className="text-base text-muted-foreground hover:text-foreground transition-colors truncate text-left w-full focus-visible:outline-none focus-visible:underline"
                        >
                          {currentTrack.artist}
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleLikeTrack(currentTrack.id)}
                      className={`p-2 -mr-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full ${isLiked ? 'text-blue-500 hover:text-blue-400' : 'text-foreground/50 hover:text-foreground'}`}
                      aria-label={isLiked ? "Unlike track" : "Like track"}
                    >
                      <Heart className={`h-7 w-7 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeView === 'lyrics' && (
                <motion.div 
                  key="lyrics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full flex-1 flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img src={currentTrack.coverUrl} className="w-16 h-16 rounded-md shadow-lg" alt="" />
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{currentTrack.title}</h3>
                      <p className="text-muted-foreground text-sm">{currentTrack.artist}</p>
                    </div>
                  </div>
                  <LyricsView trackId={currentTrack.id} />
                </motion.div>
              )}

              {activeView === 'comments' && (
                <motion.div 
                  key="comments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full flex-1 flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img src={currentTrack.coverUrl} className="w-16 h-16 rounded-md shadow-lg" alt="" />
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{currentTrack.title}</h3>
                      <p className="text-muted-foreground text-sm">{currentTrack.artist}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">
                    <div className="flex gap-3">
                      <img src={userProfile.avatar} className="w-8 h-8 rounded-full" alt="" />
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          placeholder="Add a comment..." 
                          className="w-full bg-foreground/5 rounded-full py-2 px-4 text-sm text-foreground outline-none border border-transparent focus:border-foreground/20 transition-all"
                        />
                      </div>
                    </div>
                    {[
                      { id: 1, user: "Neon Voyager", avatar: "https://picsum.photos/100/100?random=21", text: "This track is absolutely mind-blowing! The bass is perfect.", time: "2h ago" },
                      { id: 2, user: "Sarah Jenkins", avatar: "https://picsum.photos/100/100?random=32", text: "Love the atmospheric vibes here. Great work!", time: "5h ago" },
                      { id: 3, user: "CryptoPioneer", avatar: "https://picsum.photos/100/100?random=50", text: "Added this immediately. A future classic.", time: "1d ago" },
                    ].map(comment => (
                      <div key={comment.id} className="flex gap-3 group">
                        <img src={comment.avatar} className="w-8 h-8 rounded-full" alt="" />
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-sm font-bold text-foreground">{comment.user}</span>
                            <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                          </div>
                          <p className="text-sm text-foreground/80">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeView === 'artist' && (
                <motion.div 
                  key="artist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full flex-1 flex flex-col"
                >
                  <div className="flex flex-col items-center gap-4 mb-6">
                    {artistData && (
                      <img src={artistData.avatarUrl} className="w-32 h-32 rounded-full shadow-lg" alt={currentTrack.artist} />
                    )}
                    <h3 className="font-bold text-2xl">{currentTrack.artist}</h3>
                    <p className="text-muted-foreground text-sm text-center">{artistData?.bio || "No biography available."}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                    <h4 className="font-bold text-foreground">Similar Tracks</h4>
                    {allTracks.filter(t => t.artistId === currentTrack.artistId && t.id !== currentTrack.id).slice(0, 3).map(track => (
                      <div key={track.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => playTrack(track)}>
                        <img src={track.coverUrl} className="w-12 h-12 rounded-md" alt="" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">{track.title}</p>
                          <p className="text-xs text-muted-foreground">{track.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeView === 'playlist' && (
                <motion.div 
                  key="playlist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full flex-1 flex flex-col"
                >
                  <h3 className="font-bold text-lg mb-6">Featured Playlists</h3>
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                    {/* Placeholder for playlists */}
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="font-bold text-blue-400">Featured: TonJam Top 50</p>
                      <p className="text-xs text-muted-foreground">The best tracks on TonJam right now.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="font-bold text-foreground">Suggested: Chill Vibes</p>
                      <p className="text-xs text-muted-foreground">Perfect for relaxing.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Player Controls (Always visible at bottom) */}
          <div className="mt-auto pt-4">
            {/* Progress Bar */}
            <div className="w-full mb-6 group">
              <div className="relative h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden mb-2">
                <div 
                  className="absolute top-0 left-0 h-full bg-foreground transition-all duration-100 group-hover:bg-blue-500"
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
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Playback Controls */}
            <div className="w-full flex items-center justify-between mb-6">
              <button 
                onClick={toggleShuffle}
                className={`p-2 transition-all focus-visible:outline-none rounded-full ${isShuffle ? 'text-blue-500 hover:text-blue-400' : 'text-foreground/50 hover:text-foreground'}`}
                aria-label={isShuffle ? "Disable shuffle" : "Enable shuffle"}
              >
                <Shuffle className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={prevTrack}
                  className="p-2 text-foreground hover:text-foreground/80 transition-all active:scale-90 focus-visible:outline-none rounded-full"
                  aria-label="Previous track"
                >
                  <SkipBack className="h-8 w-8 fill-current" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-background focus-visible:outline-none"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 fill-current" />
                  ) : (
                    <Play className="h-8 w-8 fill-current ml-1" />
                  )}
                </button>
                
                <button 
                  onClick={nextTrack}
                  className="p-2 text-foreground hover:text-foreground/80 transition-all active:scale-90 focus-visible:outline-none rounded-full"
                  aria-label="Next track"
                >
                  <SkipForward className="h-8 w-8 fill-current" />
                </button>
              </div>
              
              <button 
                onClick={toggleRepeat}
                className={`p-2 transition-all focus-visible:outline-none rounded-full ${isRepeat ? 'text-blue-500 hover:text-blue-400' : 'text-foreground/50 hover:text-foreground'}`}
                aria-label={isRepeat ? "Disable repeat" : "Enable repeat"}
              >
                <Repeat className="h-5 w-5" />
              </button>
            </div>

            {/* Secondary Actions / View Switcher */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveView(activeView === 'lyrics' ? 'player' : 'lyrics')}
                  className={`p-2 rounded-full transition-all ${activeView === 'lyrics' ? 'bg-foreground/20 text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                  aria-label="Toggle Lyrics"
                >
                  <Mic2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setActiveView(activeView === 'artist' ? 'player' : 'artist')}
                  className={`p-2 rounded-full transition-all ${activeView === 'artist' ? 'bg-foreground/20 text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                  aria-label="Toggle Artist Info"
                >
                  <Music2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setActiveView(activeView === 'playlist' ? 'player' : 'playlist')}
                  className={`p-2 rounded-full transition-all ${activeView === 'playlist' ? 'bg-foreground/20 text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                  aria-label="Toggle Playlists"
                >
                  <ListMusic className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setActiveView(activeView === 'comments' ? 'player' : 'comments')}
                  className={`p-2 rounded-full transition-all ${activeView === 'comments' ? 'bg-foreground/20 text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                  aria-label="Toggle Comments"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex gap-4">
                <button 
                  className="p-2 text-foreground/50 hover:text-amber-500 transition-all rounded-full"
                  aria-label="Mint NFT"
                >
                  <Gem className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 text-foreground/50 hover:text-foreground transition-all rounded-full"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setShowQueue(!showQueue)}
                  className={`p-2 rounded-full transition-all ${showQueue ? 'text-blue-500 hover:text-blue-400' : 'text-foreground/50 hover:text-foreground'}`}
                  aria-label="Queue"
                >
                  <ListMusic className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Visualizer (Subtle at the bottom) */}
            {activeView === 'player' && (
              <AudioVisualizer isPlaying={isPlaying} />
            )}
          </div>
        </div>
      </div>

      {/* Queue Overlay */}
      <AnimatePresence>
        {showQueue && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-[#060c1a]/95 backdrop-blur-3xl flex flex-col"
          >
            <div className="sticky top-0 flex items-center justify-between p-6 bg-[#060c1a]/80 backdrop-blur-md z-10">
              <h3 className="text-lg font-bold uppercase tracking-widest">Play Queue</h3>
              <button 
                onClick={() => setShowQueue(false)}
                className="p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-all"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Now Playing</h4>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
                <img src={currentTrack.coverUrl} className="w-12 h-12 rounded-md" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-blue-400 truncate">{currentTrack.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                </div>
                <AudioVisualizer isPlaying={isPlaying} />
              </div>

              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Next Up</h4>
              {queue.map((track, index) => (
                <div 
                  key={`${track.id}-${index}`} 
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    playTrack(track);
                    setShowQueue(false);
                  }}
                >
                  <img src={track.coverUrl} className="w-12 h-12 rounded-md opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-foreground">
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                </div>
              ))}
              {queue.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Queue is empty</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FullPlayer;
