import React from 'react';
import { Play, Pause, BadgeCheck } from 'lucide-react';
import { MusicPreviewData } from './types';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';

interface MusicNotificationPreviewProps {
  preview: MusicPreviewData;
  onPreviewClick?: () => void;
}

export const MusicNotificationPreview: React.FC<MusicNotificationPreviewProps> = ({
  preview,
  onPreviewClick,
}) => {
  const { playTrack, currentTrack, isPlaying, togglePlay, allTracks } = useAudio();

  const isCurrentPlaying =
    currentTrack &&
    (currentTrack.id === preview.trackId ||
      currentTrack.title.toLowerCase() === preview.title.toLowerCase()) &&
    isPlaying;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      currentTrack &&
      (currentTrack.id === preview.trackId ||
        currentTrack.title.toLowerCase() === preview.title.toLowerCase())
    ) {
      togglePlay();
      return;
    }

    const found = allTracks.find(
      (t) =>
        t.id === preview.trackId ||
        t.title.toLowerCase() === preview.title.toLowerCase()
    );

    if (found && found.audioUrl) {
      playTrack(found);
      toast.success('Playing Track', { description: `${preview.title} • ${preview.artist}` });
    } else if (preview.audioUrl) {
      playTrack({
        id: preview.trackId || `track-${Date.now()}`,
        title: preview.title,
        artist: preview.artist,
        coverUrl: preview.artwork || '',
        audioUrl: preview.audioUrl,
        duration: preview.duration || 0,
        genre: 'Music',
        isNFT: false,
        createdAt: new Date().toISOString(),
      } as any);
      toast.success('Playing Track', { description: `${preview.title} • ${preview.artist}` });
    } else {
      toast.info('Audio preview unavailable');
    }
  };

  return (
    <div
      onClick={onPreviewClick}
      className="mt-2 w-full flex items-center justify-between p-2 rounded-xl bg-[#080D1A]/70 hover:bg-[#080D1A] transition-colors group cursor-pointer"
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#16243E]">
          {preview.artwork && (
            <img
              src={preview.artwork}
              alt={preview.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {isCurrentPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#9B7CFF] animate-ping" />
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-[#F5F7FB] truncate leading-tight">
            {preview.title}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[11px] text-[#94A3B8] truncate leading-none">
              {preview.artist}
            </span>
            {preview.isVerified && (
              <BadgeCheck className="w-3 h-3 text-[#2DD4BF] shrink-0" />
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handlePlayToggle}
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
          isCurrentPlaying
            ? 'bg-[#9B7CFF] text-white shadow-sm shadow-[#9B7CFF]/30'
            : 'bg-white/[0.08] text-[#F5F7FB] hover:bg-[#9B7CFF] hover:text-white'
        }`}
        aria-label={isCurrentPlaying ? 'Pause track' : 'Play track'}
      >
        {isCurrentPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        )}
      </button>
    </div>
  );
};

export default MusicNotificationPreview;
