import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Twitter, Instagram, Globe, Send, Disc } from 'lucide-react';
import { Artist } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import ArtistVerification from './ArtistVerification';

interface ArtistProfileHeaderProps {
  artist: Artist;
  onTip: () => void;
}

const ArtistProfileHeader: React.FC<ArtistProfileHeaderProps> = ({ artist, onTip }) => {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'x':
      case 'twitter':
        return Twitter;
      case 'instagram':
        return Instagram;
      case 'website':
      case 'link':
        return Globe;
      case 'telegram':
        return Send;
      case 'spotify':
        return Disc;
      default:
        return Globe;
    }
  };

  return (
    <motion.div 
      className="flex flex-row items-end gap-6 cursor-default w-full"
    >
      {/* Profile Picture */}
      <div className="relative -mt-20 md:-mt-28">
        <div className="w-36 h-36 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl bg-muted ring-8 ring-background">
          <img 
            src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
            className="w-full h-full object-cover" 
            alt={artist.name} 
          />
        </div>
      </div>
      
      <div className="flex flex-col items-start text-left flex-1 pb-4">
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground drop-shadow-sm">
                {artist.name}
              </h1>
              {artist.verified && (
                <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-orange-500 fill-current" />
              )}
            </div>
            
            {/* Social Icons near name */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 backdrop-blur-md rounded-2xl">
              {artist.socials && Object.entries(artist.socials).map(([platform, url]) => {
                if (!url) return null;
                const Icon = getSocialIcon(platform);
                return (
                  <a 
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-orange-500 transition-all hover:scale-110 active:scale-95"
                    title={platform}
                  >
                    <Icon className="w-4 h-4 md:w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
          {artist.username && (
            <span className="text-muted-foreground font-bold text-sm md:text-xl tracking-tight opacity-70">
              @{artist.username.replace('@', '')}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-start">
            <span className="text-2xl font-black text-foreground tracking-tighter">{(artist.followers || 0).toLocaleString()}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Followers</span>
          </div>
          <div className="flex flex-col items-start pl-8">
            <span className="text-2xl font-black text-foreground tracking-tighter">{(artist.playCount || 0).toLocaleString()}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Total Plays</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArtistProfileHeader;
