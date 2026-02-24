
import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { MOCK_ARTISTS } from '../constants';

const AudioVisualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const bars = 32;
    const heights = Array(bars).fill(2);
    const targets = Array(bars).fill(2);
    let phase = 0;

    const draw = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width / bars;
      phase += 0.15;
      
      for (let i = 0; i < bars; i++) {
        if (isPlaying) {
          const wave = Math.sin(phase + i * 0.2) * 0.5 + 0.5;
          if (Math.random() > 0.6) {
            targets[i] = 4 + wave * (canvas.height * 0.5) + Math.random() * (canvas.height * 0.4);
          }
        } else {
          targets[i] = 2;
        }
        
        heights[i] += (targets[i] - heights[i]) * 0.2;
        
        const h = Math.max(2, heights[i]);
        const x = i * width;
        const y = canvas.height - h;
        
        ctx.fillStyle = '#3b82f6';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#3b82f6';
        
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
  }, [isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full max-w-[240px] h-[40px] opacity-80 mix-blend-screen"
    />
  );
};

const FullAudioPlayer: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentTrack, isPlaying, togglePlay, progress, seek, 
    nextTrack, prevTrack, setFullPlayerOpen, isShuffle, isRepeat, 
    toggleShuffle, toggleRepeat, addNotification,
    volume, isMuted, setVolume, toggleMute,
    likedTrackIds, toggleLikeTrack
  } = useAudio();
  const [view, setView] = useState<'cover' | 'lyrics'>('cover');
  const [showVolume, setShowVolume] = useState(false);
  const initialVolumeRef = useRef(volume);

  useEffect(() => {
    if (volume !== initialVolumeRef.current) {
      setShowVolume(true);
      initialVolumeRef.current = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (showVolume) {
      const timer = setTimeout(() => {
        setShowVolume(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showVolume]);

  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;
  const artistData = MOCK_ARTISTS.find(a => a.id === currentTrack?.artistId);

  if (!currentTrack) return null;

  const handleArtistClick = () => {
    setFullPlayerOpen(false);
    navigate(`/artist/${currentTrack.artistId}`);
  };

  const handleLikeToggle = () => {
    if (currentTrack) {
      toggleLikeTrack(currentTrack.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black animate-in slide-in-from-bottom duration-500 overflow-y-auto overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <img 
          src={currentTrack.coverUrl} 
          className="w-full h-full object-cover blur-[150px] opacity-20 scale-150 transition-all duration-[3s]" 
          alt="" 
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="relative z-10 min-h-full flex flex-col p-6 md:p-8 max-w-xl mx-auto w-full">
        <header className="flex items-center justify-between mb-8 flex-shrink-0">
          <button 
            onClick={() => setFullPlayerOpen(false)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all hover:bg-white/5"
          >
            <i className="fas fa-chevron-down"></i>
          </button>
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-full border border-white/5">
            <button onClick={() => setView('cover')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'cover' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white'}`}>Player</button>
            <button onClick={() => setView('lyrics')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'lyrics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white'}`}>Lyrics</button>
          </div>
          <button onClick={handleLikeToggle} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${isLiked ? 'text-red-500' : 'text-white/60 hover:text-white'}`}>
            <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center w-full pb-12">
          {view === 'cover' ? (
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl mb-10 group border border-white/10">
              <img src={currentTrack.coverUrl} className={`w-full h-full object-cover transition-transform duration-[15s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`} alt={currentTrack.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
            </div>
          ) : (
            <div className="w-full h-full max-h-[450px] overflow-y-auto no-scrollbar py-10 px-4 space-y-8">
               <p className="text-xl font-black text-white uppercase tracking-tighter leading-tight text-left">Frequencies locked, we're forging the soul</p>
               <p className="text-xl font-black text-blue-400 uppercase tracking-tighter leading-tight text-left">Digital diamonds in a decentralized bowl</p>
               <p className="text-xl font-black text-white/20 uppercase tracking-tighter leading-tight text-left">TON blockchain rhythm, heart under control</p>
            </div>
          )}

          <div className="w-full text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter uppercase text-white leading-none truncate px-4">{currentTrack.title}</h2>
            <p 
              onClick={handleArtistClick}
              className="text-blue-500 font-black text-base md:text-lg tracking-widest uppercase cursor-pointer hover:text-white transition-colors"
            >
              {currentTrack.artist}
            </p>
          </div>

          <div className="w-full flex justify-center mb-6">
            <AudioVisualizer isPlaying={isPlaying} />
          </div>

          <div className="w-full space-y-4 mb-10 px-4">
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
              <input type="range" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" value={progress} onChange={(e) => seek(Number(e.target.value))} />
              <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.7)]" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-black text-white/30 tracking-widest uppercase">
              <span>{Math.floor((progress / 100) * currentTrack.duration / 60)}:{String(Math.floor(((progress / 100) * currentTrack.duration) % 60)).padStart(2, '0')}</span>
              <span>{Math.floor(currentTrack.duration / 60)}:{String(currentTrack.duration % 60).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full max-w-[420px] mb-12 relative">
            <div className="relative flex flex-col items-center">
              <div className="absolute bottom-full mb-2">
                <div className="relative">
                  <div 
                    className={`text-lg transition-all p-2 ${showVolume ? 'text-blue-400' : 'text-white/20'}`}
                    title="Volume (Use Arrow Keys)"
                  >
                    <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute text-red-500/60' : volume < 0.5 ? 'fa-volume-low' : 'fa-volume-high'}`}></i>
                  </div>
                  
                  {showVolume && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#111] p-5 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                      <div 
                        className="h-32 w-2 bg-white/10 rounded-full relative cursor-pointer group/vslider"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const y = e.clientY - rect.top;
                          const newVolume = Math.max(0, Math.min(1, 1 - (y / rect.height)));
                          setVolume(newVolume);
                        }}
                      >
                        <div 
                          className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-full transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                          style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                        >
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/vslider:scale-100 transition-transform"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={toggleShuffle} 
                className={`text-lg transition-all p-2 ${isShuffle ? 'text-blue-400' : 'text-white/20 hover:text-white'}`}
                title="Shuffle"
              >
                <i className="fas fa-shuffle"></i>
              </button>
            </div>
            
            <button onClick={prevTrack} className="text-2xl text-white/40 hover:text-white transition-all hover:scale-125 active:scale-90 p-2"><i className="fas fa-backward-step"></i></button>
            
            <button onClick={togglePlay} className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-blue-500"><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-4xl md:text-5xl`}></i></button>
            
            <button onClick={nextTrack} className="text-2xl text-white/40 hover:text-white transition-all hover:scale-125 active:scale-90 p-2"><i className="fas fa-forward-step"></i></button>
            
            <button 
              onClick={toggleRepeat} 
              className={`text-lg transition-all p-2 ${isRepeat ? 'text-blue-400' : 'text-white/20 hover:text-white'}`}
              title="Repeat"
            >
              <i className="fas fa-repeat"></i>
            </button>
          </div>

          {/* Track Details Section */}
          <div className="w-full mt-12 pt-12 border-t border-white/5 space-y-10">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Release Intel</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white/60 uppercase tracking-widest">Release Date</span>
                <span className="text-xs font-black text-white uppercase tracking-tight">{currentTrack.releaseDate || '2023-10-01'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white/60 uppercase tracking-widest">Genre</span>
                <span className="text-xs font-black text-blue-500 uppercase tracking-tight">{currentTrack.genre}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Artist Dossier</h3>
              <div 
                className="flex items-center gap-4 mb-4 cursor-pointer group/dossier"
                onClick={handleArtistClick}
              >
                <img src={artistData?.avatarUrl} className="w-12 h-12 rounded-full border border-white/10 group-hover/dossier:border-blue-500 transition-all" alt="" />
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover/dossier:text-blue-400 transition-colors">{currentTrack.artist}</h4>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{artistData?.followers.toLocaleString()} Collectors</p>
                </div>
              </div>
              <p className="text-sm text-white/40 leading-relaxed font-medium italic">
                {artistData?.bio || "Digital pioneer forging new sonic landscapes in the TON ecosystem."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullAudioPlayer;
