import React from 'react';
import { motion } from 'motion/react';
import { Twitter, Instagram, Globe, Send, Disc, CheckCircle2, LayoutDashboard, Settings, Hammer, Edit2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Artist } from '@/types';
import { getPlaceholderImage, cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    switch ((platform || '').toLowerCase()) {
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
      <div className="relative -mt-6 md:-mt-12 flex-shrink-0 md:mr-[-48px]">
        <div className="flex flex-col items-center md:items-end">
          <div className="relative group">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 border-4 border-background shadow-2xl">
              <AvatarImage src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt={artist.name} className="object-cover" />
              <AvatarFallback className="bg-muted text-lg sm:text-xl md:text-3xl font-black">{artist.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {artist.verified && (
              <div className="absolute bottom-1 right-1 bg-background rounded-full p-0.5 shadow-lg z-10">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-blue-500 fill-current" />
              </div>
            )}
          </div>
          
          {/* Username below picture (on cover context) */}
          {artist.username && (
            <Badge variant="secondary" className="mt-2 sm:mt-3 bg-black/40 backdrop-blur-md text-white/90 border-transparent font-medium text-[10px] sm:text-xs md:text-sm tracking-tight px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap hover:bg-black/60 transition-colors">
              @{artist.username.replace('@', '')}
            </Badge>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            {isOwnProfile ? (
              <>
                <Button 
                  id="artist-edit-profile-btn"
                  onClick={onEditProfile}
                  variant="default"
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-500 rounded-full font-black text-[8px] sm:text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 px-3 sm:px-6 h-auto py-1.5 sm:py-2.5"
                >
                  <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Edit
                </Button>

                <Button 
                  id="artist-dashboard-btn"
                  onClick={() => navigate('/artist-dashboard')}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 backdrop-blur-md text-white border-white/10 rounded-full font-black text-[8px] sm:text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl active:scale-95 px-3 sm:px-6 h-auto py-1.5 sm:py-2.5"
                >
                  <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Stats
                </Button>
                
                <Button 
                  onClick={() => navigate('/mint')}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 backdrop-blur-md text-white border-white/10 rounded-full font-black text-[8px] sm:text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl active:scale-95 px-3 sm:px-6 h-auto py-1.5 sm:py-2.5"
                >
                  <Hammer className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-blue-500" />
                  Mint
                </Button>
              </>
            ) : (
              <Button 
                id="artist-tip-btn"
                onClick={onTip}
                variant="default"
                className="bg-blue-600 text-white hover:bg-blue-500 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 px-6 h-auto py-2.5"
              >
                <Zap className="h-4 w-4 mr-2 fill-current" />
                Support Artist
              </Button>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    id="artist-settings-btn"
                    onClick={() => navigate('/settings')}
                    variant="outline"
                    size="icon"
                    className="bg-white/5 backdrop-blur-md rounded-full text-white border-white/10 hover:bg-white/10 transition-all shadow-xl group active:scale-90 w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:rotate-90 transition-transform" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 pb-2 sm:pb-4">
        <div className="flex flex-col gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 id="artist-name-display" className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter text-white drop-shadow-2xl uppercase italic">
                {artist.name}
              </h1>
            </div>
            
            {/* Social Icons near name */}
            <div id="artist-socials-group" className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl">
              {artist.socials && Object.entries(artist.socials).map(([platform, url]) => {
                if (!url) return null;
                const Icon = getSocialIcon(platform);
                return (
                  <a 
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-white/70 hover:text-white transition-all hover:scale-110 active:scale-95"
                    title={platform}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        
        <div id="artist-header-stats" className="flex items-center gap-4 sm:gap-8 mt-2 sm:mt-4">
          <div className="flex flex-col items-start group/stat">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-none transition-colors group-hover/stat:text-blue-400">
              {(artist.followers || 0).toLocaleString()}
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-white/50 font-black mt-1 sm:mt-1.5">Followers</span>
          </div>
          <div className="flex flex-col items-start pl-4 sm:pl-8 border-l border-white/10 group/stat">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-none transition-colors group-hover/stat:text-blue-400">
              {(artist.playCount || 0).toLocaleString()}
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-white/50 font-black mt-1 sm:mt-1.5">Total Plays</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArtistProfileHeader;
