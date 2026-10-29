import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Play, UserCheck, Plus, Sparkles, TrendingUp, Disc } from 'lucide-react';
import { useArtist } from '@/contexts/ArtistContext';
import { useArtistAnalytics, ArtistAnalyticsProvider } from '@/contexts/ArtistAnalyticsContext';
import { useAudio } from '@/contexts/AudioContext';
import { getPlaceholderImage } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export interface FeaturedArtistCardProps {
  artistId?: string;
  className?: string;
}

const FeaturedArtistCardContent: React.FC<FeaturedArtistCardProps> = ({ artistId, className = "" }) => {
  const navigate = useNavigate();
  const { artists } = useArtist();
  const { followedUserIds = [], toggleFollowUser } = useAudio();
  const analytics = useArtistAnalytics();

  // Find target artist or default to first
  const artist = useMemo(() => {
    if (artistId) {
      const found = artists.find(a => a.uid === artistId);
      if (found) return found;
    }
    return artists[0] || {
      uid: 'dj-krupy',
      name: 'DJ Krupy',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=krupy',
      followers: 142500,
      verified: true,
      genre: 'Electronic / Phonk'
    };
  }, [artists, artistId]);

  const isFollowing = followedUserIds.includes(artist.uid);

  // Top track analytics preview
  const topTrack = analytics.topTracks[0] || {
    title: 'Midnight In TON',
    streams: 48500,
    trend: 15.4
  };

  const sparklineData = analytics.streamData.slice(-10);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/artist/${artist.uid}`)}
      className={`bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl rounded-2xl p-5 sm:p-6 cursor-pointer transition-all flex flex-col justify-between space-y-4 select-none ${className}`}
    >
      {/* Top Header: Avatar & Info */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 shadow-xl">
            <img 
              src={artist.avatarUrl || getPlaceholderImage(artist.name)} 
              alt={artist.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-black text-white truncate hover:text-cyan-400 transition-colors">
                {artist.name}
              </h3>
              {(artist.verified || artist.isVerifiedArtist) && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-medium">
              {artist.genre || 'Web3 Sonic Creator'}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              {(artist.followers || 14200).toLocaleString()} followers
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFollowUser(artist.uid);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            isFollowing 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-md'
          }`}
        >
          {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isFollowing ? 'Following' : 'Follow'}</span>
        </button>
      </div>

      {/* Mini-Stat Visualization of Top Track Recent Performance */}
      <div className="bg-black/30 p-3.5 sm:p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Disc className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Top Track</span>
              <span className="text-xs font-black text-white truncate block">{topTrack.title}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-black text-emerald-400 flex items-center justify-end gap-1">
              <TrendingUp className="w-3 h-3" /> +{topTrack.trend || 14.2}%
            </span>
            <span className="text-[9px] font-mono text-zinc-500">{topTrack.streams.toLocaleString()} streams</span>
          </div>
        </div>

        {/* Sparkline AreaChart */}
        <div className="h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="artistSparkline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="streams" 
                stroke="#00F0FF" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#artistSparkline)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export const FeaturedArtistCard: React.FC<FeaturedArtistCardProps> = (props) => {
  return (
    <ArtistAnalyticsProvider>
      <FeaturedArtistCardContent {...props} />
    </ArtistAnalyticsProvider>
  );
};

export default FeaturedArtistCard;
