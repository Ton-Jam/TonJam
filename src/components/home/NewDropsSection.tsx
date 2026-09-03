import React, { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, Music } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "@/contexts/AudioContext";
import { useLibrary } from "@/contexts/LibraryContext";
import TrackCard from "@/components/TrackCard";
import { MOCK_TRACKS } from "@/constants";

export const NewDropsSection: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks } = useAudio();
  const { selectedGenre, setSelectedGenre, availableGenres } = useLibrary();
  const scrollRef = useRef<HTMLDivElement>(null);
  const genreScrollRef = useRef<HTMLDivElement>(null);

  const baseTracks = useMemo(() => {
    const list = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    return list;
  }, [allTracks]);

  const filteredDrops = useMemo(() => {
    if (!selectedGenre || selectedGenre === 'All') {
      const repeated = [...baseTracks];
      while (repeated.length < 12) {
        repeated.push(...baseTracks.map((t, idx) => ({ ...t, id: `${t.id}-drop-${idx}` })));
      }
      return repeated.slice(0, 12);
    }

    // Filter by genre
    const lowerGenre = selectedGenre.toLowerCase();
    const matched = baseTracks.filter(t => {
      const trackGenre = (t.genre || '').toLowerCase();
      const trackMood = (t.mood || '').toLowerCase();
      const trackTitle = (t.title || '').toLowerCase();
      return (
        trackGenre.includes(lowerGenre) || 
        lowerGenre.includes(trackGenre) ||
        trackMood.includes(lowerGenre) ||
        trackTitle.includes(lowerGenre)
      );
    });

    if (matched.length > 0) {
      const repeated = [...matched];
      while (repeated.length < 8 && repeated.length > 0) {
        repeated.push(...matched.map((t, idx) => ({ ...t, id: `${t.id}-${lowerGenre}-${idx}` })));
      }
      return repeated.slice(0, 12);
    }

    // If no exact match found in base list, generate genre-attributed new drops from available catalog
    return baseTracks.slice(0, 6).map((t, idx) => ({
      ...t,
      id: `${t.id}-drop-${lowerGenre}-${idx}`,
      genre: selectedGenre,
      title: `${t.title} (${selectedGenre} Mix)`
    }));
  }, [baseTracks, selectedGenre]);

  const handleSelectGenre = (genre: string) => {
    setSelectedGenre(genre);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-3.5 text-left w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            New Drops
          </h2>
          {selectedGenre !== 'All' && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              {selectedGenre}
            </span>
          )}
        </div>
        <button 
          onClick={() => navigate(`/explore/tracks?title=New+Drops&filter=new${selectedGenre !== 'All' ? `&genre=${encodeURIComponent(selectedGenre)}` : ''}`)} 
          className="text-xs font-bold text-primary flex items-center gap-1 outline-none cursor-pointer border-none bg-transparent hover:text-primary/80 transition-colors"
        >
          More <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic Horizontal Scroll Genre Filter Bar */}
      <div 
        ref={genreScrollRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 w-full snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {availableGenres.map((genre) => {
          const isSelected = (selectedGenre || 'All') === genre;
          return (
            <motion.button
              key={genre}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectGenre(genre)}
              className={`shrink-0 snap-start px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border-none outline-none ${
                isSelected
                  ? "bg-primary text-black"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {genre === 'All' ? 'All Drops' : genre}
            </motion.button>
          );
        })}
      </div>

      {/* Horizontal Scroll Track Cards */}
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-0.5 w-full snap-x snap-mandatory min-h-[220px]"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {filteredDrops.length > 0 ? (
            filteredDrops.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="w-[140px] sm:w-[155px] shrink-0 snap-start"
              >
                <TrackCard 
                  track={track} 
                  variant="default" 
                  className="w-full"
                />
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-8 text-center">
              <Music className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-sm font-semibold text-zinc-400">No new drops found for {selectedGenre}</p>
              <button
                onClick={() => handleSelectGenre('All')}
                className="mt-3 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer border-none outline-none"
              >
                View All Drops
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default NewDropsSection;
