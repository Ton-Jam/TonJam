import React, { useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Heart, Play, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { MOCK_TRACKS } from '@/constants';

const FavoriteTracks: React.FC = () => {
  const { likedTrackIds, playTrack, setHeaderTitle, setOptionsTrack } = useAudio();
  const navigate = useNavigate();

  useEffect(() => {
    setHeaderTitle('Favorite Tracks');
    return () => setHeaderTitle('');
  }, [setHeaderTitle]);

  const likedTracks = MOCK_TRACKS.filter(t => likedTrackIds.includes(t.id));

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <main className="px-2 py-4 sm:px-4 max-w-full">
        <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {likedTracks.length} Saved Tracks
            </p>
            <Button 
                className="rounded-full h-8 w-8 bg-blue-600 hover:bg-blue-500 text-white transition-all hover:scale-110 active:scale-95"
                onClick={() => likedTracks.length > 0 && playTrack(likedTracks[0] as any)}
            >
                <Play className="h-4 w-4 fill-current ml-0.5" />
            </Button>
        </div>

        <div className="space-y-1">
          {likedTracks.length > 0 ? (
            likedTracks.map((track, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={track.id}
                className="group flex items-center gap-3.5 p-2 rounded-[3px] bg-transparent hover:bg-white/[0.04] transition-all cursor-pointer select-none"
                onClick={() => playTrack(track as any)}
              >
                <div className="w-12 h-12 rounded-[3px] overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/12 relative">
                  <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={track.title} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-medium leading-tight text-white/95 truncate">{track.title}</h4>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOptionsTrack(track as any);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-dashed border-white/10">
                <Heart className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight">No Liked Tracks</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Add tracks to your favorites to see them here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FavoriteTracks;
