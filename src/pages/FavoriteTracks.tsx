import React, { useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';
import { Heart, Play, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { MOCK_TRACKS } from '@/constants';

const FavoriteTracks: React.FC = () => {
  const { likedTrackIds, playTrack, setHeaderTitle } = useAudio();
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
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                {likedTracks.length} Recorded Frequencies in your Vault
            </p>
            <Button 
                className="rounded-full h-8 w-8 bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_30px_rgba(219,39,119,0.3)] transition-all hover:scale-110 active:scale-95"
                onClick={() => likedTracks.length > 0 && playTrack(likedTracks[0] as any)}
            >
                <Play className="h-4 w-4 fill-current" />
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
                className="group flex items-center gap-3 p-3 rounded-[4px] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer border-b border-white/5 hover:border-pink-500/10"
                onClick={() => playTrack(track as any)}
              >
                <div className="w-10 h-10 rounded-[4px] overflow-hidden flex-shrink-0 bg-muted/20">
                  <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[10px] font-black uppercase tracking-tighter truncate">{track.title}</h4>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{track.artist}</p>
                </div>
                <div className="hidden md:block text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                  {track.genre || 'Signal'}
                </div>
                <div className="flex items-center gap-2">
                   <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />
                   <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-dashed border-white/10">
                <Heart className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Your Heart is Silent</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-xs mx-auto opacity-50">
                Add tracks to your favorites to see them here in this neural sector.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FavoriteTracks;
