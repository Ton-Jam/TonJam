import React, { useEffect, useState, useRef } from 'react';
import { useAudio } from '@/context/AudioContext';
import { 
  PlayIcon, 
  PauseIcon, 
  BackwardIcon, 
  ForwardIcon, 
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  ChevronDownIcon, 
  HeartIcon, 
  ShareIcon, 
  EllipsisHorizontalIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlusCircleIcon,
  SparklesIcon,
  ListBulletIcon,
  ChatBubbleLeftRightIcon,
  MusicalNoteIcon,
  MicrophoneIcon,
  InformationCircleIcon,
  UserPlusIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { 
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
  HeartIcon as HeartIconSolid,
  BackwardIcon as BackwardIconSolid,
  ForwardIcon as ForwardIconSolid
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ARTISTS, MOCK_TRACKS } from '@/constants';
import { useNavigate } from 'react-router-dom';
import { getPlaceholderImage } from '@/lib/utils';

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

const LyricsView: React.FC<{ lyrics: string }> = ({ lyrics }) => {
  // Simple split by newline for now, assuming lyrics are provided as a string
  const lines = lyrics.split('\n');

  return (
    <div className="w-full h-[400px] overflow-y-auto no-scrollbar py-2 px-2 space-y-2 text-left mask-image-gradient">
      {lines.map((line, i) => (
        <motion.p 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="text-[16px] md:text-[20px] font-bold tracking-tight leading-tight text-foreground/80 hover:text-foreground transition-colors"
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
    allTracks,
    setTrackToAddToPlaylist
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
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[60] bg-background overflow-y-auto no-scrollbar"
      ref={containerRef}
    >
      {/* Dynamic Blurred Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40 blur-[100px] scale-150 pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `url(${currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-full">
        {/* Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background/10 backdrop-blur-md">
          <button 
            onClick={() => setFullPlayerOpen(false)}
            className="p-2 -ml-2 text-foreground/80 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
            aria-label="Close full player"
          >
            <ChevronDownIcon className="h-8 w-8" />
          </button>
          <div className="text-center flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50">Now Playing</span>
            <span className="text-xs font-bold text-foreground tracking-tight mt-1">TonJam Network</span>
          </div>
          <button 
            className="p-2 -mr-2 text-foreground/80 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
            aria-label="More options"
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col px-4 pb-20 max-w-2xl mx-auto w-full space-y-12">
          
          {/* 1. Main Player Section */}
          <section className="w-full flex flex-col pt-4">
            {/* Album Art */}
            <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 relative group">
              <img 
                src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)} 
                alt={currentTrack.title} 
                className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear ${isPlaying ? 'scale-105' : 'scale-100'}`}
              />
            </div>
            
            {/* Track Info & Like Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="min-w-0 flex-1 pr-4">
                <h2 className="text-[28px] md:text-[32px] font-bold text-foreground tracking-tight truncate mb-1">
                  {currentTrack.title}
                </h2>
                <button 
                  onClick={() => {
                    setFullPlayerOpen(false);
                    navigate(`/artist/${currentTrack.artistId}`);
                  }}
                  className="text-lg md:text-xl text-muted-foreground hover:text-foreground transition-colors truncate text-left w-full focus-visible:outline-none focus-visible:underline"
                >
                  {currentTrack.artist}
                </button>
              </div>
              <button 
                onClick={() => toggleLikeTrack(currentTrack.id)}
                className={`p-3 -mr-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full ${isLiked ? 'text-blue-500 hover:text-blue-400' : 'text-foreground/50 hover:text-foreground'}`}
                aria-label={isLiked ? "Unlike track" : "Like track"}
              >
                {isLiked ? (
                  <HeartIconSolid className="h-9 w-9" />
                ) : (
                  <HeartIcon className="h-9 w-9" />
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full mb-6 group">
              <div className="relative h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden mb-3">
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
              <div className="flex justify-between text-[12px] font-mono text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Playback Controls */}
            <div className="w-full flex items-center justify-between mb-8">
              <button 
                onClick={toggleShuffle}
                className={`p-2 transition-all focus-visible:outline-none rounded-full ${isShuffle ? 'text-blue-500 hover:text-blue-400' : 'text-foreground/50 hover:text-foreground'}`}
                aria-label={isShuffle ? "Disable shuffle" : "Enable shuffle"}
              >
                <ArrowsRightLeftIcon className="h-6 w-6" />
              </button>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={prevTrack}
                  className="p-2 text-foreground hover:text-foreground/80 transition-all active:scale-90 focus-visible:outline-none rounded-full"
                  aria-label="Previous track"
                >
                  <BackwardIconSolid className="h-10 w-10" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-background focus-visible:outline-none shadow-xl shadow-foreground/10"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <PauseIconSolid className="h-10 w-10" />
                  ) : (
                    <PlayIconSolid className="h-10 w-10 ml-1" />
                  )}
                </button>
                
                <button 
                  onClick={nextTrack}
                  className="p-2 text-foreground hover:text-foreground/80 transition-all active:scale-90 focus-visible:outline-none rounded-full"
                  aria-label="Next track"
                >
                  <ForwardIconSolid className="h-10 w-10" />
                </button>
              </div>
              
              <button 
                onClick={toggleRepeat}
                className={`p-2 transition-all focus-visible:outline-none rounded-full ${isRepeat ? 'text-blue-500 hover:text-blue-400' : 'text-foreground/50 hover:text-foreground'}`}
                aria-label={isRepeat ? "Disable repeat" : "Enable repeat"}
              >
                <ArrowPathRoundedSquareIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center justify-between bg-foreground/5 p-4 rounded-2xl">
              <div className="flex gap-4">
                <button 
                  onClick={() => setTrackToAddToPlaylist(currentTrack)}
                  className="p-2 text-foreground/50 hover:text-blue-500 transition-all rounded-full"
                  aria-label="Add to playlist"
                >
                  <PlusCircleIcon className="h-6 w-6" />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 text-foreground/50 hover:text-foreground transition-all rounded-full"
                  aria-label="Share"
                >
                  <ShareIcon className="h-6 w-6" />
                </button>
                <button 
                  onClick={() => setShowQueue(!showQueue)}
                  className={`p-2 rounded-full transition-all ${showQueue ? 'text-blue-500 hover:text-blue-400' : 'text-foreground/50 hover:text-foreground'}`}
                  aria-label="Queue"
                >
                  <ListBulletIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex gap-4">
                <button 
                  className="p-2 text-foreground/50 hover:text-amber-500 transition-all rounded-full"
                  aria-label="Mint NFT"
                >
                  <SparklesIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Visualizer */}
            <AudioVisualizer isPlaying={isPlaying} />
          </section>

          {/* 2. Track Details Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-500" />
              <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-foreground/70">Track Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-foreground/5 p-4 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Release Date</p>
                <p className="text-sm font-bold text-foreground">{currentTrack.releaseDate ? new Date(currentTrack.releaseDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="bg-foreground/5 p-4 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Genre</p>
                <p className="text-sm font-bold text-foreground">{currentTrack.genre || 'N/A'}</p>
              </div>
              <div className="bg-foreground/5 p-4 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Tempo</p>
                <p className="text-sm font-bold text-foreground">{currentTrack.bpm ? `${currentTrack.bpm} BPM` : 'N/A'}</p>
              </div>
              <div className="bg-foreground/5 p-4 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Key</p>
                <p className="text-sm font-bold text-foreground">{currentTrack.key || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* 3. Artist Card Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <MusicalNoteIcon className="h-5 w-5 text-blue-500" />
              <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-foreground/70">About the Artist</h3>
            </div>
            {artistData && (
              <div className="bg-foreground/5 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={artistData.avatarUrl || getPlaceholderImage(`artist-${artistData.id}`)} 
                    className="w-20 h-20 rounded-full object-cover border-2 border-background shadow-xl" 
                    alt={artistData.name} 
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xl font-bold text-foreground">{artistData.name}</h4>
                      {artistData.verified && <CheckBadgeIcon className="h-5 w-5 text-blue-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{artistData.followers?.toLocaleString() || '0'} Followers</p>
                  </div>
                  <button className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                    Follow
                  </button>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
                  {artistData.bio || "No biography available for this artist."}
                </p>
                <button 
                  onClick={() => {
                    setFullPlayerOpen(false);
                    navigate(`/artist/${artistData.id}`);
                  }}
                  className="text-xs font-bold text-blue-500 uppercase tracking-widest hover:underline"
                >
                  View Full Profile
                </button>
              </div>
            )}
          </section>

          {/* 4. Lyrics Section (If available) */}
          {currentTrack.lyrics && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <MicrophoneIcon className="h-5 w-5 text-blue-500" />
                <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-foreground/70">Lyrics</h3>
              </div>
              <div className="bg-foreground/5 p-6 rounded-2xl">
                <LyricsView lyrics={currentTrack.lyrics} />
              </div>
            </section>
          )}

          {/* 5. Comments Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
              <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-foreground/70">Comments</h3>
            </div>
            <div className="bg-foreground/5 p-6 rounded-2xl space-y-6">
              <div className="flex gap-3">
                <img src={userProfile.avatar || getPlaceholderImage(`user-${userProfile.id}`)} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    className="w-full bg-background/50 rounded-xl py-3 px-4 text-sm text-foreground outline-none border border-foreground/10 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { id: 1, user: "Neon Voyager", avatar: "https://picsum.photos/100/100?random=21", text: "This track is absolutely mind-blowing! The bass is perfect.", time: "2h ago" },
                  { id: 2, user: "Sarah Jenkins", avatar: "https://picsum.photos/100/100?random=32", text: "Love the atmospheric vibes here. Great work!", time: "5h ago" },
                  { id: 3, user: "CryptoPioneer", avatar: "https://picsum.photos/100/100?random=50", text: "Added this immediately. A future classic.", time: "1d ago" },
                ].map(comment => (
                  <div key={comment.id} className="flex gap-3 group">
                    <img src={comment.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-bold text-foreground">{comment.user}</span>
                        <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors border-t border-foreground/5 mt-4">
                View all 24 comments
              </button>
            </div>
          </section>

          {/* 6. Similar Tracks Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <MusicalNoteIcon className="h-5 w-5 text-blue-500" />
              <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-foreground/70">Similar Tracks</h3>
            </div>
            <div className="space-y-2">
              {(allTracks || []).filter(t => t.id !== currentTrack?.id).slice(0, 5).map(track => (
                <div 
                  key={track.id} 
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-foreground/5 cursor-pointer transition-all group" 
                  onClick={() => playTrack(track)}
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden">
                    <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <PlayIconSolid className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">{formatTime(track.duration || 0)}</span>
                    <button className="p-2 text-foreground/30 hover:text-foreground transition-colors">
                      <EllipsisHorizontalIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Featured Playlists Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ListBulletIcon className="h-5 w-5 text-blue-500" />
              <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-foreground/70">Featured Playlists</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer group">
                <div className="w-full aspect-video rounded-xl bg-blue-500/20 mb-3 overflow-hidden">
                  <img src={getPlaceholderImage('playlist-1')} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" alt="" />
                </div>
                <p className="font-bold text-blue-400">TonJam Top 50</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Updated Daily</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/50 border border-transparent hover:border-foreground/10 transition-all cursor-pointer group">
                <div className="w-full aspect-video rounded-xl bg-foreground/5 mb-3 overflow-hidden">
                  <img src={getPlaceholderImage('playlist-2')} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" alt="" />
                </div>
                <p className="font-bold text-foreground">Chill Vibes</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Curated for you</p>
              </div>
            </div>
          </section>

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
            className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-3xl flex flex-col"
          >
            <div className="sticky top-0 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md z-10">
              <h3 className="text-lg font-bold uppercase tracking-widest">Play Queue</h3>
              <button 
                onClick={() => setShowQueue(false)}
                className="p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-all"
              >
                <ChevronDownIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Now Playing</h4>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
                <img src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)} className="w-16 h-16 rounded-xl shadow-lg" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-blue-400 truncate">{currentTrack.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
                </div>
                <div className="w-12">
                  <AudioVisualizer isPlaying={isPlaying} />
                </div>
              </div>

              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Next Up</h4>
              {queue.map((track, index) => (
                <div 
                  key={`${track.id}-${index}`} 
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    playTrack(track);
                    setShowQueue(false);
                  }}
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md">
                    <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <PlayIconSolid className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-foreground">
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {queue.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MusicalNoteIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">Queue is empty</p>
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
