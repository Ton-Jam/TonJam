import React from "react";
import { Play, Headphones, Moon, Zap, Target, Smile, Frown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Track } from "@/types";

interface MoodPlaylistProps {
  selectedMood: string | null;
  onClear: () => void;
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onPlayAll: (tracks: Track[]) => void;
}

const MoodPlaylist: React.FC<MoodPlaylistProps> = ({
  selectedMood,
  onClear,
  tracks,
  onPlayTrack,
  onPlayAll
}) => {
  if (!selectedMood) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="bg-gradient-to-br from-[#101A3B] to-[#0A113A]/90 rounded-2xl p-4 space-y-4 shadow-xl relative overflow-hidden text-left"
      >
        {/* Visual Glow Ornament without borders */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${
          selectedMood === 'chill' ? 'from-[#00F2FE]/10 to-transparent' :
          selectedMood === 'energetic' ? 'from-[#FF0844]/10 to-transparent' :
          selectedMood === 'focus' ? 'from-[#00CDAC]/10 to-transparent' :
          selectedMood === 'happy' ? 'from-[#FAD961]/10 to-transparent' :
          'from-[#B352E4]/10 to-transparent'
        } rounded-full blur-2xl pointer-events-none`} />

        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9AA0AE]">
              Dynamic Curation
            </span>
            <h3 className="text-base font-extrabold text-white flex items-center gap-1.5 leading-none">
              {selectedMood === 'chill' && '🧘 Celestial Chill Mix'}
              {selectedMood === 'energetic' && '⚡ High-Octane Energy Mix'}
              {selectedMood === 'focus' && '🧠 Deep Focus Synapses'}
              {selectedMood === 'happy' && '☀️ Sunshine Vibe Booster'}
              {selectedMood === 'melancholic' && '🌌 Deep Nostalgia Soundwaves'}
            </h3>
          </div>
          
          <button 
            onClick={onClear}
            className="text-xs font-semibold text-[#9AA0AE] hover:text-white transition-colors cursor-pointer border-none bg-transparent outline-none py-1 px-2.5 rounded-full bg-white/5"
          >
            Clear
          </button>
        </div>

        <p className="text-xs text-[#9AA0AE]/90 leading-relaxed relative z-10 px-0.5">
          {selectedMood === 'chill' && 'Aligning your consciousness with relaxing lo-fi loops, lush organic ambient textures, jazz-hop chords, and tranquil classical layers.'}
          {selectedMood === 'energetic' && 'Igniting your performance. Powered by active tech-house patterns, dynamic afrobeats bass, punchy rock anthems, and fast-paced electronic grooves.'}
          {selectedMood === 'focus' && 'Stabilizing cognitive rhythm. Dynamic flow forged with background synthwaves, deep ambient drones, classical string melodies, and study beats.'}
          {selectedMood === 'happy' && 'Elevating dopamine levels immediately with joyful synthpop, funky bass slaps, feel-good reggae rhythms, and sunny amapiano grooves.'}
          {selectedMood === 'melancholic' && 'A companion for the emotional journey. Curated nostalgia utilizing down-tempo lofi keys, mellow blues riffs, and expressive indie layers.'}
        </p>

        {tracks.length > 0 ? (
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#9AA0AE]">
                {tracks.length} TRACKS CURATED
              </span>
              <button
                onClick={() => onPlayAll(tracks)}
                className={`h-8 font-black text-[10px] uppercase tracking-widest px-4 rounded-full cursor-pointer border-none flex items-center gap-1.5 shadow-md transition-opacity hover:opacity-90 bg-gradient-to-r ${
                  selectedMood === 'chill' ? 'from-[#00F2FE] to-[#4FACFE] text-slate-950' :
                  selectedMood === 'energetic' ? 'from-[#FF0844] to-[#FFB199] text-slate-950' :
                  selectedMood === 'focus' ? 'from-[#00CDAC] to-[#8DDAD3] text-slate-950' :
                  selectedMood === 'happy' ? 'from-[#FAD961] to-[#F76B1C] text-slate-950' :
                  'from-[#B352E4] to-[#761AC2] text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Stream Mix
              </button>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar text-left">
              {tracks.map((track, idx) => (
                <div 
                  key={`mood-track-${track.id}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                    <span className="text-[10px] font-mono text-[#9AA0AE]/50 w-4 text-center shrink-0">
                      {idx + 1}
                    </span>
                    <img 
                      src={track.coverUrl} 
                      alt={track.title} 
                      className="w-9 h-9 rounded-lg object-cover shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate text-left">
                      <h4 className="text-xs font-bold text-white truncate leading-tight">
                        {track.title}
                      </h4>
                      <p className="text-[10px] text-[#9AA0AE] truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-[#9AA0AE]">
                      {track.genre}
                    </span>
                    <button
                      onClick={() => onPlayTrack(track)}
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#5B6BFF] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer border-none outline-none group-hover:scale-105"
                    >
                      <Play className="w-3 h-3 fill-current ml-0.5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-white/[0.02] rounded-xl relative z-10">
            <Headphones className="w-6 h-6 text-[#9AA0AE]/30 mx-auto mb-2" />
            <p className="text-xs text-[#9AA0AE]">
              No matched tracks in your current local alignment index.
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MoodPlaylist;
