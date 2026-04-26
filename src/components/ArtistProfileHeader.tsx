import React from 'react';
import { motion } from 'motion/react';
import { Twitter, Instagram, Globe, Send, Disc, CheckCircle2, LayoutDashboard, Settings, Hammer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Artist } from '@/types';
import { getPlaceholderImage, cn } from '@/lib/utils';
import ArtistVerification from './ArtistVerification';

interface ArtistProfileHeaderProps {
  artist: Artist;
  onTip: () => void;
  onEditProfile?: () => void;
  isOwnProfile?: boolean;
}

const ArtistProfileHeader: React.FC<ArtistProfileHeaderProps> = ({ artist, onTip, onEditProfile, isOwnProfile }) => {
  const navigate = useNavigate();
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
      className="flex flex-col md:flex-row-reverse items-center md:items-end gap-6 cursor-default w-full font-sans"
    >
      {/* Profile Picture Container */}
      <div className="relative -mt-8 md:-mt-12 flex-shrink-0 md:mr-[-48px]">
        <div className="flex flex-col items-center md:items-end">
          <div 
            className="w-20 h-20 md:w-32 h-32 overflow-hidden border-2 border-[#0A0A0A] shadow-2xl bg-muted" 
            style={{ borderRadius: '100px' }}
          >
            <img 
              src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
              className="w-full h-full object-cover" 
              alt={artist.name} 
            />
            {artist.verified && (
              <div className="absolute bottom-1 right-1 bg-background rounded-full p-0.5 shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5 md:w-5 h-5 text-blue-500 fill-current" />
              </div>
            )}
          </div>
          
          {/* Username below picture (on cover context) */}
          {artist.username && (
            <span id="artist-username-badge" className="mt-3 text-white/90 font-medium text-xs md:text-sm tracking-tight drop-shadow-lg bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full whitespace-nowrap">
              @{artist.username.replace('@', '')}
            </span>
          )}

          {/* Owner Actions directly below username */}
          <div className={cn("flex items-center gap-2 mt-4", !isOwnProfile && "hidden")}>
            <button 
              id="artist-dashboard-btn"
              onClick={() => navigate('/artist-dashboard')}
              className="px-6 py-2.5 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl flex items-center gap-2 active:scale-95"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            
            <button 
              onClick={() => navigate('/mint')}
              className="px-6 py-2.5 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl flex items-center gap-2 active:scale-95"
            >
              <Hammer className="h-4 w-4 text-blue-500" />
              Mint
            </button>

            <button 
              id="artist-settings-btn"
              onClick={() => navigate('/settings')}
              className="p-2.5 bg-white/5 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-all shadow-xl group active:scale-90"
              title="Settings"
            >
              <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 pb-4">
        <div className="flex flex-col gap-1.5 mb-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2">
            <div className="flex items-center gap-3">
              <h1 id="artist-name-display" className="text-xl md:text-4xl font-black tracking-tighter text-white drop-shadow-2xl uppercase">
                {artist.name}
              </h1>
            </div>
            
            {/* Social Icons near name */}
            <div id="artist-socials-group" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/5">
              {artist.socials && Object.entries(artist.socials).map(([platform, url]) => {
                if (!url) return null;
                const Icon = getSocialIcon(platform);
                return (
                  <a 
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-muted-foreground hover:text-blue-500 transition-all hover:scale-110 active:scale-95"
                    title={platform}
                  >
                    <Icon className="w-3.5 h-3.5 md:w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        
        <div id="artist-header-stats" className="flex items-center gap-6 mt-2">
          <div className="flex flex-col items-start">
            <span className="text-lg font-black text-white tracking-tight leading-none group-hover:text-blue-500 transition-colors">{(artist.followers || 0).toLocaleString()}</span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-black mt-1">Followers</span>
          </div>
          <div className="flex flex-col items-start pl-6 border-l border-white/10">
            <span className="text-lg font-black text-white tracking-tight leading-none group-hover:text-blue-500 transition-colors">{(artist.playCount || 0).toLocaleString()}</span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-black mt-1">Total Plays</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArtistProfileHeader;
