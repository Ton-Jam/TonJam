import React from "react";
import { Radio, Sparkles, Play, Plus, Zap } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { Track } from "@/types";

interface SmartRadioPanelProps {
  onClose?: () => void;
}

export const SmartRadioPanel: React.FC<SmartRadioPanelProps> = () => {
  const {
    currentTrack,
    isSmartRadio,
    toggleSmartRadio,
    startSmartRadio,
    getSmartRadioTracks,
    addToQueue,
    playTrack,
    userProfile,
    likedTrackIds = [],
    recentlyPlayed = [],
  } = useAudio();

  const [seedTrack, setSeedTrack] = React.useState<Track | null>(currentTrack);

  React.useEffect(() => {
    if (currentTrack) {
      setSeedTrack(currentTrack);
    }
  }, [currentTrack]);

  const recommendedTracks = React.useMemo(() => {
    if (!seedTrack) return [];
    return getSmartRadioTracks(seedTrack, new Set([seedTrack.id]), 5);
  }, [seedTrack, getSmartRadioTracks]);

  const handleStartRadio = () => {
    if (seedTrack) {
      startSmartRadio(seedTrack);
    }
  };

  const handleAddAll = () => {
    recommendedTracks.forEach((t) => addToQueue(t));
  };

  return (
    <div className="bg-[#0A113A]/95 backdrop-blur-xl border border-[#16244F] rounded-2xl p-4 text-[#F2F4F8] shadow-2xl space-y-4 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#16244F]">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between border-b border-[#16244F] pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl transition-all ${isSmartRadio ? "bg-[#5B6BFF] text-white shadow-[0_0_15px_rgba(91,107,255,0.5)]" : "bg-[#16244F] text-[#9AA0AE]"}`}>
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Smart Radio Engine</h3>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isSmartRadio ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-gray-500/20 text-gray-400 border border-gray-500/30"}`}>
                {isSmartRadio ? "AUTOPLAY ON" : "OFF"}
              </span>
            </div>
            <p className="text-[11px] text-[#9AA0AE]">Automatically queues similar tracks using preferences & metadata</p>
          </div>
        </div>

        <button
          onClick={toggleSmartRadio}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isSmartRadio
              ? "bg-[#5B6BFF] border-[#5B6BFF] text-white shadow-md hover:bg-[#4C5CEE]"
              : "bg-[#0A113A] border-[#16244F] text-[#9AA0AE] hover:text-white hover:bg-[#16244F]"
          }`}
        >
          {isSmartRadio ? "Disable" : "Enable"}
        </button>
      </div>

      {/* Current Seed Track */}
      {seedTrack && (
        <div className="bg-[#050B28] border border-[#16244F] rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={seedTrack.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80"}
              alt={seedTrack.title}
              className="w-11 h-11 rounded-lg object-cover border border-[#16244F] shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[10px] text-[#5B6BFF] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Radio Seed
              </div>
              <div className="text-xs font-bold text-white truncate">{seedTrack.title}</div>
              <div className="text-[11px] text-[#9AA0AE] truncate">
                {seedTrack.artist} {seedTrack.genre ? `• ${seedTrack.genre}` : ''} {seedTrack.bpm ? `• ${seedTrack.bpm} BPM` : ''}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartRadio}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#5B6BFF] text-white hover:bg-[#4C5CEE] transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Radio
          </button>
        </div>
      )}

      {/* Recommendation Reasons & User Preference Signals */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0A113A] border border-[#16244F]/80 p-2 rounded-xl text-center">
          <div className="text-[10px] text-[#9AA0AE]">Preferred Genres</div>
          <div className="text-xs font-bold text-indigo-400 truncate mt-0.5">
            {userProfile?.favoriteGenres?.[0] || seedTrack?.genre || "Electronic"}
          </div>
        </div>
        <div className="bg-[#0A113A] border border-[#16244F]/80 p-2 rounded-xl text-center">
          <div className="text-[10px] text-[#9AA0AE]">Liked Tracks</div>
          <div className="text-xs font-bold text-rose-400 mt-0.5">
            {likedTrackIds.length} Saved
          </div>
        </div>
        <div className="bg-[#0A113A] border border-[#16244F]/80 p-2 rounded-xl text-center">
          <div className="text-[10px] text-[#9AA0AE]">Recent History</div>
          <div className="text-xs font-bold text-cyan-400 mt-0.5">
            {recentlyPlayed.length} Tracks
          </div>
        </div>
      </div>

      {/* Recommended Auto-Queue Tracks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-[#F2F4F8] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Upcoming Smart Queue ({recommendedTracks.length})
          </div>
          {recommendedTracks.length > 0 && (
            <button
              onClick={handleAddAll}
              className="text-[11px] font-bold text-[#5B6BFF] hover:text-white transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add All
            </button>
          )}
        </div>

        {recommendedTracks.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#9AA0AE]">
            No similar tracks found for this seed.
          </div>
        ) : (
          <div className="space-y-1.5">
            {recommendedTracks.map((track, idx) => (
              <div
                key={track.id || idx}
                className="group bg-[#050B28]/60 border border-[#16244F]/60 hover:border-[#5B6BFF]/50 p-2 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={track.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80"}
                    alt={track.title}
                    className="w-9 h-9 rounded-md object-cover border border-[#16244F] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate group-hover:text-[#5B6BFF] transition-colors">
                      {track.title}
                    </div>
                    <div className="text-[10px] text-[#9AA0AE] truncate flex items-center gap-1">
                      <span>{track.artist}</span>
                      {track.recommendationReason && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">{track.recommendationReason}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => playTrack(track)}
                    className="p-1.5 text-[#9AA0AE] hover:text-white hover:bg-[#16244F] rounded-lg transition-colors"
                    title="Play Now"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => addToQueue(track)}
                    className="p-1.5 text-[#9AA0AE] hover:text-[#5B6BFF] hover:bg-[#16244F] rounded-lg transition-colors"
                    title="Add to Queue"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartRadioPanel;
