import React from 'react';
import { Users, BadgeCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { LibraryArtist } from '../types';

interface ArtistsProps {
  artists: LibraryArtist[];
}

export const Artists: React.FC<ArtistsProps> = ({ artists }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-500" />
          Followed Sonic Entities
        </h3>
        <span className="text-[10px] text-muted-foreground font-mono font-medium">Verified creator nodes</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {artists.map((artist) => (
          <motion.div
            key={artist.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 p-4 rounded-[10px] flex flex-col items-center text-center group transition-all"
          >
            {/* Round Avatar matching streaming design */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3.5 bg-slate-800 border-2 border-transparent group-hover:border-[#0052FF]/30 transition-all">
              <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {artist.verified && (
                <div className="absolute bottom-0 right-0 p-1 bg-[#0052FF] text-white rounded-full border-2 border-[#050A24]" title="Verified Creator">
                  <BadgeCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="space-y-1 w-full">
              <div className="flex items-center justify-center gap-1">
                <h4 className="text-xs font-extrabold text-foreground truncate max-w-[120px] group-hover:text-primary transition-colors">
                  {artist.name}
                </h4>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-wider">
                {(artist.followersCount).toLocaleString()} fans
              </p>
              
              {/* Genre badges list */}
              <div className="flex flex-wrap gap-1 justify-center pt-1.5">
                {artist.genres.slice(0, 2).map((genre) => (
                  <span key={genre} className="text-[8px] font-bold uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded-full text-muted-foreground">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
