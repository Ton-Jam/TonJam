import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { Artist } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import ArtistVerification from './ArtistVerification';

interface ArtistProfileHeaderProps {
  artist: Artist;
}

const ArtistProfileHeader: React.FC<ArtistProfileHeaderProps> = ({ artist }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileFocus={{ scale: 1.02 }}
      className="flex flex-col md:flex-row items-center md:items-end gap-6 cursor-default"
      tabIndex={0}
    >
      {/* Profile Picture */}
      <div className="relative">
        <img src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.id}`)} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-background shadow-xl" alt={artist.name} />
        {artist.verified && (
          <div className="absolute bottom-2 right-2 z-10">
            <CheckCircle2 className="w-8 h-8 text-blue-500 fill-background" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <div className="flex items-center gap-3 mb-2 flex-wrap justify-center md:justify-start">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground leading-none">
            {artist.name}
          </h1>
          {artist.handle && (
            <span className="text-blue-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.4em] bg-blue-500/10 px-3 py-1.5 rounded-full whitespace-nowrap">
              {artist.handle}
            </span>
          )}
          <ArtistVerification artist={artist} />
        </div>
        <p className="text-muted-foreground font-medium text-sm"> {artist.followers.toLocaleString()} Monthly Listeners </p>
      </div>
    </motion.div>
  );
};

export default ArtistProfileHeader;
