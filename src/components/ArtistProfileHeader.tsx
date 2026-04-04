import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { Artist } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import ArtistVerification from './ArtistVerification';

interface ArtistProfileHeaderProps {
  artist: Artist;
  onTip: () => void;
}

const ArtistProfileHeader: React.FC<ArtistProfileHeaderProps> = ({ artist, onTip }) => {
  return (
    <motion.div 
      className="flex flex-col md:flex-row items-center md:items-end gap-6 cursor-default w-full"
    >
      {/* Profile Picture */}
      <div className="relative -mt-20 md:-mt-24">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-background shadow-2xl bg-muted">
          <img 
            src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
            className="w-full h-full object-cover" 
            alt={artist.name} 
          />
        </div>
        {artist.verified && (
          <div className="absolute bottom-2 right-2 z-10 bg-background rounded-full p-1 shadow-lg">
            <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-orange-500 fill-current" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 pb-2">
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            {artist.name}
          </h1>
          {artist.username && (
            <span className="text-muted-foreground font-medium text-sm md:text-base">
              @{artist.username.replace('@', '')}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-6 mb-4">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-bold text-foreground">{(artist.followers || 0).toLocaleString()}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Followers</span>
          </div>
          <div className="flex flex-col items-center md:items-start border-l border-border pl-6">
            <span className="text-xl font-bold text-foreground">{(artist.playCount || 0).toLocaleString()}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Plays</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArtistProfileHeader;
