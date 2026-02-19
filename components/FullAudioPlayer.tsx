
import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';

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

  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

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
            className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-all hover:bg-white/10"
          >
            <i className="fas fa-chevron-down"></i>
          </button>
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-full border border-white/5">
            <button onClick={() => setView('cover')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'cover' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white'}`}>Player</button>
            <button onClick={() => setView('lyrics')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'lyrics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white'}`}>Lyrics</button>
          </div>
          <button onClick={handleLikeToggle} className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center transition-all ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-white/60 hover:text-white'}`}>
            <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center w-full pb-12">
          {view === 'cover' ? (
            <div className="relative w-full aspect-square rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl mb-10 group border border-white/10">
              <img src={currentTrack.coverUrl} className={`w-full h-full object-cover transition-transform duration-[15s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`} alt={currentTrack.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
            </div>
          ) : (
            <div className="w-full h-full max-h-[450px] overflow-y-auto no-scrollbar py-10 px-4 space-y-12">
               <p className="text-4xl font-black text-white uppercase italic tracking-tighter leading-tight text-left">Frequencies locked, we're forging the soul</p>
               <p className="text-4xl font-black text-blue-400 uppercase italic tracking-tighter leading-tight text-left">Digital diamonds in a decentralized bowl</p>
               <p className="text-4xl font-black text-white/20 uppercase italic tracking-tighter leading-tight text-left">TON blockchain rhythm, heart under control</p>
            </div>
          )}

          <div className="w-full text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter uppercase italic text-white leading-none truncate px-4">{currentTrack.title}</h2>
            <p 
              onClick={handleArtistClick}
              className="text-blue-500 font-black text-base md:text-lg tracking-widest uppercase italic cursor-pointer hover:text-white transition-colors"
            >
              {currentTrack.artist}
            </p>
          </div>

          <div className="w-full space-y-4 mb-10 px-4">
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
              <input type="range" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" value={progress} onChange={(e) => seek(Number(e.target.value))} />
              <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.7)]" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-black text-white/30 tracking-widest uppercase italic">
              <span>{Math.floor((progress / 100) * currentTrack.duration / 60)}:{String(Math.floor(((progress / 100) * currentTrack.duration) % 60)).padStart(2, '0')}</span>
              <span>{Math.floor(currentTrack.duration / 60)}:{String(currentTrack.duration % 60).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full max-w-[380px] mb-12">
            <button 
              onClick={toggleShuffle} 
              className={`text-lg transition-all p-2 ${isShuffle ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'text-white/20 hover:text-white'}`}
              title="Shuffle"
            >
              <i className="fas fa-shuffle"></i>
            </button>
            
            <button onClick={prevTrack} className="text-2xl text-white/40 hover:text-white transition-all hover:scale-125 active:scale-90 p-2"><i className="fas fa-backward-step"></i></button>
            
            <button onClick={togglePlay} className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-600 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(37,99,235,0.6)] border-4 border-white/10"><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-white text-3xl md:text-4xl`}></i></button>
            
            <button onClick={nextTrack} className="text-2xl text-white/40 hover:text-white transition-all hover:scale-125 active:scale-90 p-2"><i className="fas fa-forward-step"></i></button>
            
            <button 
              onClick={toggleRepeat} 
              className={`text-lg transition-all p-2 ${isRepeat ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'text-white/20 hover:text-white'}`}
              title="Repeat"
            >
              <i className="fas fa-repeat"></i>
            </button>
          </div>

          {/* Volume Controls */}
          <div className="w-full max-w-[300px] flex items-center gap-4 px-4">
            <button 
              onClick={toggleMute}
              className="text-white/40 hover:text-white transition-colors w-8 flex justify-center"
            >
              <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute text-red-500/60' : volume < 0.5 ? 'fa-volume-low' : 'fa-volume-high'}`}></i>
            </button>
            <div className="relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                value={isMuted ? 0 : volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))} 
              />
              <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all ${isMuted ? 'bg-white/20' : 'bg-white/40 group-hover:bg-blue-500'}`} 
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullAudioPlayer;
