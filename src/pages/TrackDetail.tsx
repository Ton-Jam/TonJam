import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Zap, CheckCircle2 } from 'lucide-react';
import { MOCK_TRACKS, MOCK_ARTISTS } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import confetti from 'canvas-confetti';

const TrackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, jamTrack } = useAudio();
  const track = useMemo(() => MOCK_TRACKS.find(t => t.id === id), [id]);
  const artist = useMemo(() => MOCK_ARTISTS.find(a => a.id === track?.artistId), [track]);
  const isActive = currentTrack?.id === track?.id;

  if (!track) {
    return <div className="p-8 text-white">Track not found</div>;
  }

  const handlePlay = () => playTrack(track);

  const handleJam = () => {
    jamTrack(track.id);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
      ticks: 200,
      gravity: 1.2,
      scalar: 0.7,
      shapes: ['circle']
    });
  };

  return (
    <div className="relative min-h-screen pb-24 animate-in fade-in duration-500">
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-blue-400 mb-6 transition-all group" >
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> BACK
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="relative aspect-square rounded-[10px] overflow-hidden shadow-xl bg-[#0a0a0a]">
            <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col">
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => navigate(`/artist/${track.artistId}`)}>
                <img src={artist?.avatarUrl || `https://picsum.photos/100/100?seed=${track.artistId}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                <p className="text-blue-500 font-bold text-xs uppercase tracking-widest">{track.artist}</p>
                {track.artistVerified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white leading-none mb-3">{track.title}</h1>
            </header>

            <div className="flex gap-4 mb-10">
              <button onClick={handlePlay} className="flex-1 py-5 electric-blue-bg text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
                {isActive && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isActive && isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              <button onClick={handleJam} className="py-5 px-6 bg-white/5 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all hover:bg-white/10">
                <Zap className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass py-4 rounded-[10px] text-center shadow-inner">
                <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest mb-1.5">BPM</p>
                <p className="text-sm font-bold text-white tracking-tighter">{track.bpm || '128'}</p>
              </div>
              <div className="glass py-4 rounded-[10px] text-center shadow-inner">
                <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest mb-1.5">DURATION</p>
                <p className="text-sm font-bold text-white tracking-tighter">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackDetail;
