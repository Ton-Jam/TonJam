import React from 'react';
import { User, BadgeCheck, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Artist } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FeaturedArtistSectionProps {
  artists: Artist[];
  followedIds: string[];
  onToggleFollow: (id: string) => void;
  title?: string;
}

export const FeaturedArtistSection: React.FC<FeaturedArtistSectionProps> = ({
  artists,
  followedIds,
  onToggleFollow,
  title
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Premium Spotlights</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">{title || "Featured Artists"}</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {artists.map((artist) => {
          const isFollowing = followedIds.includes(artist.uid);
          const imageSrc = artist.avatarUrl || getPlaceholderImage(artist.name);

          return (
            <motion.div
              key={`featured-artist-${artist.uid}`}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-[#0c133a] rounded-[12px] border border-white/5 p-4 flex flex-col items-center justify-between space-y-4 text-center duration-300 transition-all group"
            >
              <div 
                onClick={() => navigate(`/artist/${artist.uid}`)}
                className="relative cursor-pointer"
              >
                <div className="relative h-20 w-20 rounded-full overflow-hidden ring-4 ring-white/5 group-hover:ring-[#00B4D8]/30 transition-all duration-300">
                  <img
                    src={imageSrc}
                    alt={artist.name}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.src = getPlaceholderImage(artist.name); }}
                  />
                </div>
                {artist.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-[#050A24] rounded-full p-0.5">
                    <BadgeCheck className="w-5 h-5 text-[#00B4D8] fill-current" />
                  </div>
                )}
              </div>

              <div className="space-y-1 text-center truncate w-full">
                <h4 
                  onClick={() => navigate(`/artist/${artist.uid}`)}
                  className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-[#00B4D8] transition-colors cursor-pointer truncate"
                >
                  {artist.name}
                </h4>
                <p className="text-[9px] text-[#00B4D8] font-bold uppercase tracking-widest truncate">
                  {artist.genre || 'Independent'}
                </p>
                <p className="text-[9px] text-slate-500 truncate">
                  {(artist.monthlyListeners || 0).toLocaleString()} Listeners
                </p>
              </div>

              <Button
                size="sm"
                variant={isFollowing ? 'outline' : 'default'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFollow(artist.uid);
                }}
                className={`w-full py-1 text-[8px] font-bold uppercase tracking-widest rounded-[8px] h-8 transition-all ${
                  isFollowing
                    ? 'bg-transparent border border-white/10 text-white hover:bg-white/5'
                    : 'bg-[#00B4D8] text-[#050A24] hover:bg-[#00B4D8]/85'
                }`}
              >
                {isFollowing ? 'FOLLOWING' : '+ FOLLOW'}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
