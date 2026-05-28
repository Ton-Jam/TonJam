import React from 'react';
import { motion } from 'motion/react';
import LikeButton from './LikeButton';
import { Twitter, Instagram, Globe, Send, Disc, LayoutDashboard, Settings, Hammer, Edit2, Zap, UserPlus, UserCheck } from 'lucide-react';
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
      className="flex items-center justify-between gap-4 cursor-default w-full font-sans pb-2"
    >
        <div className="flex flex-col gap-1 items-start">
            {artist.username && (
                <Badge variant="secondary" className="bg-muted/40 backdrop-blur-md text-foreground/70 border-border/50 font-bold text-[8px] tracking-widest px-3 py-0.5 rounded-full uppercase hover:bg-muted/60 transition-colors w-fit mb-1">
                    {artist.username.replace('@', '')}
                </Badge>
            )}
        </div>
      
      {/* Action Buttons & Social Icons - Horizontally Aligned */}
      <div className="flex flex-wrap items-center justify-end gap-3 mt-4 md:mt-0">
        
        {isOwnProfile && (
           <Button
             onClick={() => navigate('/mint')}
             className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold uppercase tracking-widest text-[10px] px-4 py-2 h-9"
           >
              <Hammer className="w-3.5 h-3.5 mr-2" /> Mint Artifact
           </Button>
        )}

        {artist.socials && Object.values(artist.socials).some(v => !!v) && (
          <div className="hidden sm:block w-[1px] h-4 bg-muted-foreground/30 mx-1" />
        )}

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
                        className="p-2 bg-muted/40 text-foreground/60 hover:text-blue-500 hover:bg-muted/60 rounded-full transition-all active:scale-90 border border-border/50 flex items-center justify-center w-9 h-9"
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
      </div>
    </motion.div>
  );
};

export default ArtistProfileHeader;
