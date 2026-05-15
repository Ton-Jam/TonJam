import React from 'react';
import { motion } from 'motion/react';
import LikeButton from './LikeButton';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start text-left gap-6 cursor-default w-full font-sans pb-4"
    >
      {/* Profile Info */}
      <div className="flex items-end gap-6">
        <div className="relative group/avatar flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full" />
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 border-4 border-background shadow-[0_0_50px_rgba(37,99,235,0.2)] relative z-10 transition-transform duration-700 group-hover/avatar:scale-[1.02]">
              <AvatarImage src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt={artist.name} className="object-cover" />
              <AvatarFallback className="bg-muted text-xl sm:text-2xl font-black">{artist.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {artist.verified && (
              <div className="absolute bottom-1 right-1 bg-background rounded-full p-1 shadow-2xl z-20 border border-blue-500/20">
                <CheckCircle2 className="w-4 h-4 text-blue-500 fill-current" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start gap-1">
            {artist.username && (
                <Badge variant="secondary" className="bg-muted/40 backdrop-blur-md text-foreground/70 border-border/50 font-bold text-[9px] tracking-widest px-3 py-0.5 rounded-full uppercase hover:bg-muted/60 transition-colors w-fit">
                    {artist.username.replace('@', '')}
                </Badge>
            )}
            <h1 id="artist-name-display" className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.04em] text-white uppercase leading-none">
                {artist.name}
            </h1>
        </div>
      </div>
      
      {/* Social Icons & Stats - Spotify usually puts them below */}
      <div className="flex items-center gap-4">
        {/* Stats & Like */}
        <div id="artist-header-actions" className="flex items-center gap-4">
            <LikeButton targetId={artist.uid} targetType="artist" />
            <div id="artist-header-stats" className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white tracking-tight leading-none">
                    {(artist.followers || 0).toLocaleString()}
                    </span>
                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-black">Followers</span>
                </div>
                <div className="w-[1px] h-3 bg-white/20" />
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white tracking-tight leading-none">
                    {(artist.playCount || 0).toLocaleString()}
                    </span>
                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-black">Plays</span>
                </div>
            </div>
        </div>

        {/* Social Icons */}
        <div id="artist-socials-group" className="flex items-center gap-3">
            {artist.socials && Object.entries(artist.socials).map(([platform, url]) => {
                if (!url) return null;
                const Icon = getSocialIcon(platform);
                return (
                <TooltipProvider key={platform}>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <a 
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90"
                        aria-label={platform}
                        >
                        <Icon className="w-4 h-4" />
                        </a>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 backdrop-blur-md border-white/10 text-[10px] font-black uppercase tracking-widest text-white">
                        <p>{platform}</p>
                    </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                );
            })}
        </div>
      </div>

    </motion.div>
  );
};

export default ArtistProfileHeader;
