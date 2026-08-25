import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Sparkles, Moon, Zap, Target, Smile, Frown } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import MoodPlaylist from "@/components/MoodPlaylist";
import { MOCK_TRACKS } from "@/constants";

const MOODS = [
  { id: 'chill', name: 'Chill', icon: Moon, description: 'Ambient, Lofi, Jazz & Classical frequencies', color: 'from-[#00F2FE] to-[#4FACFE]', textAccent: 'text-[#00F2FE]' },
  { id: 'energetic', name: 'Hype', icon: Zap, description: 'Techno, Electronic, Rock & Afrobeats beats', color: 'from-[#FF0844] to-[#FFB199]', textAccent: 'text-[#FF0844]' },
  { id: 'focus', name: 'Focus', icon: Target, description: 'Deep study ambient & classical tones', color: 'from-[#00CDAC] to-[#8DDAD3]', textAccent: 'text-[#00CDAC]' },
  { id: 'happy', name: 'Happy', icon: Smile, description: 'Upbeat pop, funk & sunny vibes', color: 'from-[#FAD961] to-[#F76B1C]', textAccent: 'text-[#FAD961]' },
  { id: 'melancholic', name: 'Deep', icon: Frown, description: 'Nostalgic lofi & slow r&b layers', color: 'from-[#B352E4] to-[#761AC2]', textAccent: 'text-[#B352E4]' },
];

export const MoodAlignmentSection: React.FC = () => {
  const { allTracks, playTrack, playAll } = useAudio();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const MOOD_GENRES_MAP = useMemo<Record<string, string[]>>(() => ({
    chill: ['lofi', 'ambient', 'jazz', 'r&b', 'classical', 'synthwave'],
    energetic: ['electronic', 'techno', 'house', 'rock', 'afrobeats', 'pop', 'synthwave', 'amapiano'],
    focus: ['lofi', 'ambient', 'classical', 'synthwave'],
    happy: ['pop', 'funk', 'reggae', 'afrobeats', 'amapiano'],
    melancholic: ['lofi', 'r&b', 'jazz', 'rock', 'ambient']
  }), []);

  const curatedMoodTracks = useMemo(() => {
    if (!selectedMood) return [];
    
    const mappedGenres = MOOD_GENRES_MAP[selectedMood] || [];
    const tracksSource = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    
    return tracksSource.filter((track) => {
      const trackMoodLower = track.mood?.toLowerCase() || '';
      const isMoodMatch = trackMoodLower === selectedMood || trackMoodLower.includes(selectedMood);
      
      const trackGenreLower = track.genre?.toLowerCase() || '';
      const isGenreMatch = mappedGenres.some(g => trackGenreLower.includes(g) || g.includes(trackGenreLower));
      
      return isMoodMatch || isGenreMatch;
    });
  }, [selectedMood, allTracks, MOOD_GENRES_MAP]);

  return (
    <motion.section 
      animate={{
        backgroundColor: selectedMood === 'chill' ? 'rgba(0, 242, 254, 0.04)' :
                         selectedMood === 'energetic' ? 'rgba(255, 8, 68, 0.04)' :
                         selectedMood === 'focus' ? 'rgba(0, 205, 172, 0.04)' :
                         selectedMood === 'happy' ? 'rgba(250, 217, 97, 0.04)' :
                         selectedMood === 'melancholic' ? 'rgba(179, 82, 228, 0.04)' :
                         'rgba(0, 0, 0, 0)',
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="space-y-3.5 text-left p-3 sm:p-4 rounded-3xl -mx-3 sm:-mx-4 transition-all"
    >
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary shrink-0 animate-pulse" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            Mood & Energy Alignment
          </h2>
        </div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          Quick Flow
        </span>
      </div>

      {/* Mood Selector Pills (Horizontal Scroll) */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 px-0.5">
        {MOODS.map((mood) => {
          const MoodIcon = mood.icon;
          const isSelected = selectedMood === mood.id;
          return (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              key={mood.id}
              onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl w-[90px] sm:w-[100px] shrink-0 transition-all duration-300 outline-none cursor-pointer border-none text-center ${
                isSelected 
                  ? `bg-gradient-to-br ${mood.color} text-black font-black` 
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-white'
              }`}
            >
              <MoodIcon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-black' : mood.textAccent}`} />
              <span className={`text-[11px] font-black tracking-tight ${isSelected ? 'text-black' : 'text-zinc-200'}`}>
                {mood.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Curated Dynamic Playlist Section (Renders when a mood is selected) */}
      {selectedMood && (
        <MoodPlaylist
          selectedMood={selectedMood}
          onClear={() => setSelectedMood(null)}
          tracks={curatedMoodTracks}
          onPlayTrack={playTrack}
          onPlayAll={playAll}
        />
      )}
    </motion.section>
  );
};

export default MoodAlignmentSection;
