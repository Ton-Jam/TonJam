import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/contexts/AudioContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { BackButton } from '@/components/BackButton';
import { 
  Play, 
  Pause, 
  Trash2, 
  Shuffle, 
  Sparkles, 
  Compass, 
  Radio, 
  Plus, 
  Music, 
  Check, 
  SkipForward, 
  Volume2, 
  Flame, 
  Library as LibraryIcon,
  Disc3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '@/types';
import { MOCK_TRACKS } from '@/constants';
import emptyQueueIllustration from '@/assets/images/empty_queue_illustration_1791583279786.jpg';

export const QueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    queue, 
    setQueue, 
    removeFromQueue, 
    clearQueue, 
    playTrack, 
    isShuffle, 
    toggleShuffle, 
    isSmartRadio, 
    toggleSmartRadio, 
    startSmartRadio,
    addToQueue,
    allTracks
  } = useAudio();

  // Format track duration mm:ss
  const formatDuration = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '3:20';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Compute total queue runtime
  const totalQueueSeconds = useMemo(() => {
    return queue.reduce((acc, t) => acc + (t.duration || 180), 0);
  }, [queue]);

  const formattedTotalRuntime = useMemo(() => {
    const mins = Math.floor(totalQueueSeconds / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m`;
  }, [totalQueueSeconds]);

  // Recommended tracks to quick-add (exclude items currently in queue or playing)
  const recommendedTracks = useMemo(() => {
    const pool = (allTracks && allTracks.length > 0) ? allTracks : MOCK_TRACKS;
    const existingIds = new Set(queue.map(t => t.id));
    if (currentTrack) existingIds.add(currentTrack.id);
    return pool.filter(t => !existingIds.has(t.id)).slice(0, 5);
  }, [allTracks, queue, currentTrack]);

  return (
    <PageLayout containerClassName="max-w-4xl mx-auto px-4 space-y-6" topSpacing="default">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton 
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
            ariaLabel="Back" 
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
              <span>Playing Queue</span>
              {queue.length > 0 && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#0088CC]/20 text-[#0088CC]">
                  {queue.length}
                </span>
              )}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {queue.length > 0 
                ? `${queue.length} upcoming tracks • ${formattedTotalRuntime} total runtime`
                : 'No tracks currently queued to play next'
              }
            </p>
          </div>
        </div>

        {/* Queue Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Smart Radio Toggle */}
          <button
            type="button"
            onClick={toggleSmartRadio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isSmartRadio 
                ? 'bg-purple-600/30 text-purple-300 shadow-sm' 
                : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
            title="Auto-queue similar tracks when queue reaches the end"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Smart Radio</span>
          </button>

          {/* Shuffle Button */}
          {queue.length > 1 && (
            <button
              type="button"
              onClick={toggleShuffle}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                isShuffle ? 'bg-[#0088CC]/30 text-[#0088CC]' : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title="Shuffle Queue"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          )}

          {/* Clear Queue Button */}
          {queue.length > 0 && (
            <button
              type="button"
              onClick={clearQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Clear all tracks from queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. NOW PLAYING CARD */}
      {currentTrack && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0088CC] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0088CC] animate-ping" />
              Now Playing
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {formatDuration(currentTrack.duration)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-lg">
                <img 
                  src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80'} 
                  alt={currentTrack.title} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                    <span className="w-1 h-3 bg-[#0088CC] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-5 bg-[#0088CC] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2 bg-[#0088CC] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  {currentTrack.artist} {currentTrack.album ? `• ${currentTrack.album}` : ''}
                </p>
                {currentTrack.isNFT && (
                  <span className="inline-block text-[9px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md mt-1">
                    NFT Audio
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#0088CC] hover:bg-[#0077b3] text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-md"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={nextTrack}
                className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
                title="Skip to next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. UP NEXT QUEUE LIST OR ENGAGING EMPTY QUEUE STATE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Up Next In Queue ({queue.length})
          </h2>
          {queue.length > 0 && (
            <span className="text-[11px] text-zinc-500">
              Drag or tap track to play
            </span>
          )}
        </div>

        {queue.length === 0 ? (
          /* ======================================================== */
          /* ENGAGING 'EMPTY QUEUE' STATE ILLUSTRATION & CTA          */
          /* ======================================================== */
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-6 sm:p-10 rounded-3xl bg-white/[0.02] text-center space-y-6 shadow-inner"
          >
            {/* Visual 3D Holographic Illustration */}
            <div className="relative mx-auto w-52 h-52 sm:w-60 sm:h-60 group">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#0088CC]/20 via-purple-500/10 to-cyan-400/20 blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
              <img 
                src={emptyQueueIllustration} 
                alt="Empty Music Queue Illustration" 
                className="relative w-full h-full object-cover rounded-3xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer" 
              />
            </div>

            {/* Typography */}
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Your Music Queue Is Silent
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
                Nothing lined up to play next. Explore fresh Web3 drops, start smart radio recommendations, or pick tracks from your library to fill your sonic queue.
              </p>
            </div>

            {/* Interactive Call-To-Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/discover')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0088CC] hover:bg-[#0077b3] text-white text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#0088CC]/25"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Music</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const seed = currentTrack || recommendedTracks[0] || MOCK_TRACKS[0];
                  if (seed) startSmartRadio(seed);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-lg shadow-purple-600/25"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Start Smart Radio</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/library')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
              >
                <LibraryIcon className="w-4 h-4 text-zinc-300" />
                <span>My Library</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ACTIVE QUEUE TRACKS LIST */
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {queue.map((track, idx) => (
                <motion.div
                  key={`${track.id}-${idx}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-all group select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                    {/* Track Number / Play icon on hover */}
                    <div 
                      onClick={() => playTrack(track)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-[#0088CC] transition-colors cursor-pointer shrink-0 font-mono text-xs font-bold"
                    >
                      <span className="group-hover:hidden">{idx + 1}</span>
                      <Play className="w-3.5 h-3.5 fill-current hidden group-hover:block ml-0.5" />
                    </div>

                    {/* Artwork */}
                    <div 
                      onClick={() => playTrack(track)}
                      className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 cursor-pointer"
                    >
                      <img 
                        src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80'} 
                        alt={track.title} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1" onClick={() => playTrack(track)}>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer group-hover:text-[#0088CC] transition-colors">
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {track.artist} {track.album ? `• ${track.album}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Duration */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-zinc-500 font-mono">
                      {formatDuration(track.duration)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromQueue(track.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                      title="Remove track from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 4. RECOMMENDED TRACKS TO QUICK-ADD TO QUEUE */}
      {recommendedTracks.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Recommended For You
              </h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="text-xs font-bold text-[#0088CC] hover:underline cursor-pointer"
            >
              Browse All
            </button>
          </div>

          <div className="space-y-1.5">
            {recommendedTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                    <img 
                      src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80'} 
                      alt={track.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                    {formatDuration(track.duration)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addToQueue(track)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0088CC]/10 hover:bg-[#0088CC] text-[#0088CC] hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                    title="Add to queue"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Queue</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default QueuePage;
