import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Gem,
  Activity,
  Maximize2,
  Minimize2,
  Sparkles,
  Sliders,
  Share2,
  Coins,
  ShieldCheck,
  Disc3,
  Flame,
  Award
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { CanvasAudioAnalyzer, VisualizerMode, VisualizerTheme } from './CanvasAudioAnalyzer';
import { getPlaceholderImage, shareContent } from '@/lib/utils';
import { toast } from 'sonner';

interface EnhancedMusicPlayerProps {
  className?: string;
  defaultView?: 'artwork' | 'visualizer' | 'hybrid';
  onClose?: () => void;
}

export const EnhancedMusicPlayer: React.FC<EnhancedMusicPlayerProps> = ({
  className = '',
  defaultView = 'visualizer',
  onClose,
}) => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    seek,
    nextTrack,
    prevTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    analyser,
  } = useAudio();

  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [activeView, setActiveView] = useState<'artwork' | 'visualizer' | 'hybrid'>(defaultView);
  const [vizMode, setVizMode] = useState<VisualizerMode>('bars');
  const [vizTheme, setVizTheme] = useState<VisualizerTheme>('cyber');
  const [showEqPanel, setShowEqPanel] = useState<boolean>(false);

  if (!currentTrack) {
    return (
      <div className={`p-6 rounded-2xl bg-[#050A24] border border-[#16244F] text-center text-zinc-400 ${className}`}>
        <Disc3 className="w-10 h-10 mx-auto text-cyan-400 animate-spin-slow mb-2" />
        <p className="text-sm font-bold">No Music Track Loaded</p>
        <p className="text-xs text-zinc-500">Select an MP3 track or Music NFT to start listening</p>
      </div>
    );
  }

  const trackDuration = currentTrack.duration || 180;
  const currentSeconds = Math.floor((progress / 100) * trackDuration);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleShare = () => {
    shareContent({
      title: `${currentTrack.title} by ${currentTrack.artist}`,
      text: `Listen to "${currentTrack.title}" with live Canvas Audio Analyzer on TonJam!`,
      url: window.location.href,
    });
  };

  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl bg-[#050A24] border border-[#16244F] p-4 sm:p-6 shadow-2xl text-white select-none ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#0098EA]/20 text-[#0098EA] border border-[#0098EA]/40">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold tracking-tight text-white">Enhanced NFT Audio Player</h3>
              {currentTrack.isNFT && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                  Music NFT
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Real-time Canvas Frequency Spectrum Analyzer</p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 gap-1">
          <button
            onClick={() => setActiveView('artwork')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              activeView === 'artwork' ? 'bg-[#0098EA] text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Artwork
          </button>
          <button
            onClick={() => setActiveView('visualizer')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              activeView === 'visualizer' ? 'bg-[#0098EA] text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Visualizer
          </button>
          <button
            onClick={() => setActiveView('hybrid')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              activeView === 'hybrid' ? 'bg-[#0098EA] text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Hybrid
          </button>
        </div>
      </div>

      {/* Main Display Stage */}
      <div className="my-4">
        {activeView === 'artwork' && (
          <div className="relative w-full aspect-square max-h-[280px] mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 group">
            <img
              src={currentTrack.coverUrl || getPlaceholderImage('cover')}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-white">{currentTrack.title}</h2>
                <p className="text-xs font-semibold text-cyan-400">{currentTrack.artist}</p>
              </div>
            </div>
          </div>
        )}

        {activeView === 'visualizer' && (
          <CanvasAudioAnalyzer
            analyser={analyser}
            isPlaying={isPlaying}
            track={currentTrack}
            height={220}
            mode={vizMode}
            theme={vizTheme}
            onModeChange={(m) => setVizMode(m)}
            showControls={true}
            showMetrics={true}
          />
        )}

        {activeView === 'hybrid' && (
          <div className="space-y-3">
            <div className="flex gap-3 items-center bg-white/5 p-3 rounded-2xl border border-white/10">
              <img
                src={currentTrack.coverUrl || getPlaceholderImage('cover')}
                alt={currentTrack.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-lg border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white truncate">{currentTrack.title}</h4>
                <p className="text-xs text-cyan-400 font-medium truncate">{currentTrack.artist}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Award className="w-3 h-3" /> Hi-Fi 320kbps
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Coins className="w-3 h-3" /> TON Verified
                  </span>
                </div>
              </div>
            </div>

            <CanvasAudioAnalyzer
              analyser={analyser}
              isPlaying={isPlaying}
              track={currentTrack}
              height={150}
              mode={vizMode}
              theme={vizTheme}
              onModeChange={(m) => setVizMode(m)}
              showControls={true}
              showMetrics={false}
            />
          </div>
        )}
      </div>

      {/* Progress Bar & Time */}
      <div className="space-y-1 my-3">
        <div className="relative w-full h-2 rounded-full bg-white/10 overflow-hidden cursor-pointer group">
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 px-1">
          <span>{formatTime(currentSeconds)}</span>
          <span>{formatTime(trackDuration)}</span>
        </div>
      </div>

      {/* Primary Transport Controls */}
      <div className="flex items-center justify-between py-2">
        {/* Shuffle */}
        <button
          onClick={toggleShuffle}
          className={`p-2 rounded-xl transition-all ${
            isShuffle ? 'bg-[#0098EA]/20 text-[#0098EA] border border-[#0098EA]/40' : 'text-zinc-400 hover:text-white'
          }`}
          title="Toggle Shuffle"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Skip Back */}
        <button
          onClick={prevTrack}
          className="p-2 text-zinc-300 hover:text-white transition-transform active:scale-90"
          title="Previous Track"
        >
          <SkipBack className="w-6 h-6" />
        </button>

        {/* Play / Pause Toggle */}
        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0098EA] to-blue-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,152,234,0.5)] hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
        </button>

        {/* Skip Forward */}
        <button
          onClick={nextTrack}
          className="p-2 text-zinc-300 hover:text-white transition-transform active:scale-90"
          title="Next Track"
        >
          <SkipForward className="w-6 h-6" />
        </button>

        {/* Repeat */}
        <button
          onClick={toggleRepeat}
          className={`p-2 rounded-xl transition-all ${
            repeatMode !== 'off'
              ? 'bg-[#0098EA]/20 text-[#0098EA] border border-[#0098EA]/40'
              : 'text-zinc-400 hover:text-white'
          }`}
          title={`Repeat: ${repeatMode}`}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Volume & Audio Settings Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-zinc-400 hover:text-white">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0098EA]"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Preset Button */}
          <button
            onClick={() => {
              const rates = [1.0, 1.25, 1.5, 2.0];
              const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
              setPlaybackRate(rates[nextIdx]);
              toast.info(`Playback speed set to ${rates[nextIdx]}x`);
            }}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-extrabold text-cyan-400 hover:bg-white/10"
          >
            {playbackRate}x Speed
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMusicPlayer;
