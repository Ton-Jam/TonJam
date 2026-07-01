import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, Users, MessageSquare, UserPlus, UserCheck, Play, 
  BarChart3, Sparkles, ShieldCheck, Star, Music, Heart 
} from 'lucide-react';
import { ArtistPlaceholder } from '../../placeholders/ArtistPlaceholder';

// --- TS INTERFACES ---

export interface ArtistData {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bannerUrl?: string;
  isVerified?: boolean;
  followersCount: number;
  monthlyListeners?: number;
  featuredTrackTitle?: string;
  featuredTrackCover?: string;
  genre?: string;
  bio?: string;
  nftHolders?: number;
  totalSalesVolume?: string;
  rank?: number;
  mutualFollowers?: string[];
}

// --- 1. BASE ARTIST CARD ---
export const ArtistCard: React.FC<{
  artist?: ArtistData;
  isLoading?: boolean;
  onFollow?: (artist: ArtistData) => void;
  onMessage?: (artist: ArtistData) => void;
  className?: string;
}> = ({ artist, isLoading, onFollow, onMessage, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [following, setFollowing] = useState(false);

  if (isLoading || !artist) {
    return (
      <div className={`flex flex-col p-4 rounded-[10px] bg-[#0A113A]/60 animate-pulse w-[170px] shrink-0 text-center ${className}`}>
        <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-3" />
        <div className="h-4 bg-white/10 rounded w-2/3 mx-auto mb-2" />
        <div className="h-3 bg-white/10 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col p-4 rounded-[10px] bg-[#0A113A] hover:bg-[#101A3B] transition-colors cursor-pointer w-[170px] shrink-0 snap-start select-none relative text-center ${className}`}
    >
      <div className="relative w-16 h-16 mx-auto mb-3 bg-slate-950 rounded-full overflow-hidden shrink-0">
        {imgFailed ? (
          <ArtistPlaceholder size={24} />
        ) : (
          <img src={artist.avatarUrl} alt={artist.name} onError={() => setImgFailed(true)} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex flex-col items-center min-w-0">
        <div className="flex items-center justify-center gap-1 w-full">
          <span className="text-[13px] font-black text-white truncate max-w-[85%]">{artist.name}</span>
          {artist.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />}
        </div>
        <p className="text-[10px] text-[#9AA0AE] font-mono mt-0.5 truncate w-full">{artist.username}</p>
      </div>

      <div className="mt-2.5 pt-2 border-t border-white/5 flex justify-center gap-3 font-mono text-[10px] text-[#9AA0AE]">
        <div>
          <span className="block font-black text-white">{artist.followersCount >= 1000 ? `${(artist.followersCount / 1000).toFixed(1)}K` : artist.followersCount}</span>
          <span className="text-[8px] uppercase tracking-wider opacity-75">fans</span>
        </div>
        {artist.monthlyListeners !== undefined && (
          <div>
            <span className="block font-black text-white">{artist.monthlyListeners >= 1000 ? `${(artist.monthlyListeners / 1000).toFixed(0)}K` : artist.monthlyListeners}</span>
            <span className="text-[8px] uppercase tracking-wider opacity-75">syncs</span>
          </div>
        )}
      </div>

      <div className="mt-3.5 flex gap-1.5 w-full">
        <button
          onClick={(e) => { e.stopPropagation(); setFollowing(!following); onFollow?.(artist); }}
          className={`flex-1 py-1.5 rounded-[6px] text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
            following ? 'bg-white/10 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {following ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
          <span>{following ? 'Synced' : 'Follow'}</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onMessage?.(artist); }} className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-[6px] transition-colors shrink-0">
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

// --- 2. FEATURED ARTIST CARD (Full-Bleed Header) ---
export const FeaturedArtistCard: React.FC<{
  artist: ArtistData;
  onFollow?: (artist: ArtistData) => void;
  onPlayHit?: (artist: ArtistData) => void;
  className?: string;
}> = ({ artist, onFollow, onPlayHit, className = '' }) => {
  const [following, setFollowing] = useState(false);
  return (
    <div className={`relative rounded-[10px] overflow-hidden bg-[#0A113A] aspect-[16/10] w-full select-none ${className}`}>
      {artist.bannerUrl && <img src={artist.bannerUrl} alt={artist.name} className="w-full h-full object-cover opacity-50" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A24] via-[#050A24]/40 to-transparent p-5 flex flex-col justify-end" />
      
      <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-slate-950">
            <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5 flex items-center gap-1 w-max">
              <Star className="w-2.5 h-2.5 fill-current" /> ARTIST OF THE WEEK
            </span>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xl font-black text-white leading-none truncate uppercase tracking-tight">{artist.name}</h3>
              {artist.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500 fill-current shrink-0" />}
            </div>
            {artist.bio && <p className="text-xs text-[#9AA0AE] mt-1.5 truncate max-w-sm">{artist.bio}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {artist.featuredTrackTitle && (
            <button onClick={() => onPlayHit?.(artist)} className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg active:scale-95 transition-transform">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          )}
          <button
            onClick={() => { setFollowing(!following); onFollow?.(artist); }}
            className={`py-2 px-4 rounded-[6px] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              following ? 'bg-white/10 text-white' : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {following ? 'SYNCED' : 'SYNC NOW'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. VERIFIED ARTIST CARD ---
export const VerifiedArtistCard: React.FC<{
  artist: ArtistData;
  className?: string;
}> = ({ artist, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-950">
          <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="text-sm font-bold truncate">{artist.name}</h4>
            <ShieldCheck className="w-4 h-4 text-emerald-400 fill-current shrink-0" />
          </div>
          <p className="text-[11px] text-[#9AA0AE] mt-0.5">{artist.genre || 'Various Genres'}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="text-[10px] uppercase tracking-wider text-[#9AA0AE] block">Monthly Syncs</span>
        <span className="text-sm font-black text-emerald-400 font-mono">{(artist.monthlyListeners || 0).toLocaleString()}</span>
      </div>
    </div>
  );
};

// --- 4. TOP ARTIST CARD (Rank Listing layout) ---
export const TopArtistCard: React.FC<{
  artist: ArtistData;
  rank: number;
  className?: string;
}> = ({ artist, rank, className = '' }) => {
  return (
    <div className={`flex items-center p-3 rounded-[10px] bg-[#0A113A] gap-3 select-none ${className}`}>
      <span className="font-mono text-base font-black text-white/30 w-6 text-center">{rank}</span>
      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-slate-950">
        <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <h4 className="text-[13px] font-bold text-white truncate">{artist.name}</h4>
          {artist.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />}
        </div>
        <p className="text-[10px] text-[#9AA0AE] font-mono mt-0.5">{artist.followersCount.toLocaleString()} fans</p>
      </div>
      <button className="p-1.5 hover:bg-white/10 rounded-full text-white/55 hover:text-white transition-colors">
        <MessageSquare className="w-4 h-4" />
      </button>
    </div>
  );
};

// --- 5. SUGGESTED ARTIST CARD (Recommender with mutual indicators) ---
export const SuggestedArtistCard: React.FC<{
  artist: ArtistData;
  reason?: string;
  onFollow?: (artist: ArtistData) => void;
  className?: string;
}> = ({ artist, reason = 'Popular on TonJam', onFollow, className = '' }) => {
  const [following, setFollowing] = useState(false);
  return (
    <div className={`p-3 bg-[#0A113A] rounded-[10px] flex flex-col justify-between select-none w-44 shrink-0 snap-start ${className}`}>
      <div>
        <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block truncate w-full mb-3">
          💡 {reason}
        </span>
        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-950 mx-auto mb-2">
          <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
        </div>
        <div className="text-center min-w-0">
          <h4 className="text-[13px] font-bold text-white truncate">{artist.name}</h4>
          <p className="text-[10px] text-[#9AA0AE] truncate mt-0.5">{artist.followersCount.toLocaleString()} fans</p>
        </div>
      </div>
      <button
        onClick={() => { setFollowing(!following); onFollow?.(artist); }}
        className={`w-full mt-3 py-1.5 rounded-[6px] text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
          following ? 'bg-white/10 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        {following ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
        <span>{following ? 'Synced' : 'Sync'}</span>
      </button>
    </div>
  );
};

// --- 6. ARTIST STATS CARD (Analytics metrics breakdown) ---
export const ArtistStatsCard: React.FC<{
  artist: ArtistData;
  className?: string;
}> = ({ artist, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white ${className}`}>
      <div className="flex items-center gap-2 mb-3.5">
        <BarChart3 className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">Artist Performance</span>
      </div>
      <div className="grid grid-cols-2 gap-4 font-mono text-[11px] text-[#9AA0AE]">
        <div>
          <span>Monthly sync listeners</span>
          <span className="block text-sm font-black text-white mt-1">{(artist.monthlyListeners || 0).toLocaleString()}</span>
        </div>
        <div>
          <span>Total fans syncing</span>
          <span className="block text-sm font-black text-white mt-1">{artist.followersCount.toLocaleString()}</span>
        </div>
        <div>
          <span>NFT Series Holders</span>
          <span className="block text-sm font-black text-purple-400 mt-1">{(artist.nftHolders || 0).toLocaleString()} users</span>
        </div>
        <div>
          <span>Volume Sales</span>
          <span className="block text-sm font-black text-emerald-400 mt-1">{artist.totalSalesVolume || '0.00'} TON</span>
        </div>
      </div>
    </div>
  );
};
