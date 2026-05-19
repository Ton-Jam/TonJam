import React from 'react';
import { motion } from 'motion/react';
import LikeButton from './LikeButton';
import { Twitter, Instagram, Globe, Send, Disc, CheckCircle2, LayoutDashboard, Settings, Hammer, Edit2, Zap, UserPlus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/context/AudioContext';
import { toast } from 'sonner';
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
  const { followedUserIds, toggleFollowUser } = useAudio();
  const isFollowing = followedUserIds?.includes(artist?.uid || "");

  const handleFollow = () => {
    if (artist?.uid) {
      toggleFollowUser(artist.uid);
      toast(isFollowing ? "Signal disconnected" : "Neural connection established");
    }
  };

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
      className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 cursor-default w-full font-sans pb-2"
    >
      <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        {/* Profile Info */}
        <div className="relative group/avatar flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full" />
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-4 border-background shadow-2xl relative z-10 transition-transform duration-700 group-hover/avatar:scale-[1.02] bg-background">
              <AvatarImage src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt={artist.name} className="object-cover" />
              <AvatarFallback className="bg-muted text-xl sm:text-2xl font-black">{artist.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {artist.verified && (
              <div className="absolute bottom-1 right-1 bg-background rounded-full p-1 shadow-2xl z-20 border border-blue-500/20">
                <CheckCircle2 className="w-5 h-5 text-blue-500 fill-current" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start gap-1">
            {artist.username && (
                <Badge variant="secondary" className="bg-muted/40 backdrop-blur-md text-foreground/70 border-border/50 font-bold text-[8px] tracking-widest px-3 py-0.5 rounded-full uppercase hover:bg-muted/60 transition-colors w-fit mb-1">
                    {artist.username.replace('@', '')}
                </Badge>
            )}
            <h1 id="artist-name-display" className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.04em] text-foreground dark:text-white uppercase leading-none text-center md:text-left drop-shadow-md">
                {artist.name}
            </h1>
            
            {/* Stats - Compacted and moved here for better flow */}
            <div id="artist-header-stats" className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm md:text-base font-black text-foreground dark:text-white tracking-tight">
                    {(artist.followers || 0).toLocaleString()}
                    </span>
                    <span className="text-[7px] uppercase tracking-widest text-muted-foreground font-black">Followers</span>
                </div>
                <div className="w-[1px] h-3 bg-muted-foreground/30" />
                <div className="flex items-center gap-1.5">
                    <span className="text-sm md:text-base font-black text-foreground dark:text-white tracking-tight">
                    {(artist.playCount || 0).toLocaleString()}
                    </span>
                    <span className="text-[7px] uppercase tracking-widest text-muted-foreground font-black">Plays</span>
                </div>
                <div className="ml-2">
                   <LikeButton targetId={artist.uid} targetType="artist" />
                </div>
            </div>
        </div>
      </div>
      
      {/* Action Buttons & Social Icons */}
      <div className="flex flex-col items-center md:items-end gap-3">
        <div id="artist-socials-group" className="flex items-center gap-2">
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
                        className="p-2 bg-muted/40 text-foreground/60 hover:text-blue-500 hover:bg-muted/60 rounded-full transition-all active:scale-90 border border-border/50"
                        aria-label={platform}
                        >
                        <Icon className="w-3.5 h-3.5" />
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

        <div className="flex items-center gap-2">
          {!isOwnProfile ? (
            <>
              <Button 
                onClick={handleFollow}
                className={cn(
                  "px-6 h-9 rounded-full font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                  isFollowing 
                    ? "bg-muted text-foreground border border-border hover:bg-muted/80" 
                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg"
                )}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3 h-3" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    Follow
                  </>
                )}
              </Button>
              <Button 
                onClick={onTip}
                variant="outline"
                className="px-6 h-9 rounded-full font-black text-[9px] uppercase tracking-widest border-border/50 hover:bg-muted transition-all active:scale-95"
              >
                <Zap className="w-3 h-3 mr-1.5 text-blue-500 fill-current" />
                Tip
              </Button>
            </>
          ) : (
            <Button 
              onClick={onEditProfile}
              className="px-6 h-9 bg-blue-600 text-white hover:bg-blue-500 rounded-full font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-lg"
            >
              <Edit2 className="w-3 h-3 mr-1.5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ArtistProfileHeader;
