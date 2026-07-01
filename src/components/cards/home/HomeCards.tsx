import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Flame, Heart, Sparkles, ChevronRight, Compass, Zap, 
  ListMusic, Award, Radio, AlertCircle 
} from 'lucide-react';
import { TrackPlaceholder } from '../../placeholders/TrackPlaceholder';

// --- TS INTERFACES ---

export interface ContinueTrackData {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  progressPercent: number; // e.g. 65 for 65% done
}

// --- 1. HERO BANNER ---
export const HeroBanner: React.FC<{
  title: string;
  subtitle: string;
  ctaText?: string;
  onCTA?: () => void;
  imageUrl?: string;
  className?: string;
}> = ({ title, subtitle, ctaText = 'EXPLORE MARKET', onCTA, imageUrl, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-[10px] overflow-hidden bg-[#0A113A] w-full min-h-[180px] p-6 flex flex-col justify-between select-none ${className}`}
    >
      {imageUrl && <img src={imageUrl} alt="hero bg" className="absolute inset-0 w-full h-full object-cover opacity-35" />}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050A24] via-[#050A24]/60 to-transparent z-0" />
      
      <div className="z-10 max-w-md">
        <span className="text-[8px] font-black uppercase bg-blue-600 text-white px-2.5 py-0.5 rounded-full tracking-widest inline-block mb-2.5">
          TONJAM EXCLUSIVE
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase tracking-tight">{title}</h2>
        <p className="text-[11px] sm:text-xs text-[#9AA0AE] leading-relaxed mt-1.5">{subtitle}</p>
      </div>

      <div className="mt-4 z-10">
        <button onClick={onCTA} className="py-2 px-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-[6px] shadow-lg active:scale-95 transition-transform">
          {ctaText}
        </button>
      </div>
    </motion.div>
  );
};

// --- 2. SPONSORED FEED CARD ---
export const SponsoredFeedCard: React.FC<{
  title: string;
  sponsorName: string;
  description: string;
  imageUrl?: string;
  ctaText?: string;
  onCTA?: () => void;
  className?: string;
}> = ({ title, sponsorName, description, imageUrl, ctaText = 'MINT NOW', onCTA, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[420px] ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 font-black flex items-center justify-center text-[10px]">S</div>
          <span className="text-[10px] font-black text-[#9AA0AE] uppercase tracking-wider">{sponsorName}</span>
        </div>
        <span className="text-[8px] font-black text-[#9AA0AE] bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-widest">Sponsored</span>
      </div>

      {imageUrl && (
        <div className="w-full h-40 rounded-lg overflow-hidden mb-3.5 bg-slate-950">
          <img src={imageUrl} alt="sponsor art" className="w-full h-full object-cover" />
        </div>
      )}

      <h4 className="text-[14px] font-black leading-tight uppercase tracking-tight">{title}</h4>
      <p className="text-xs text-[#9AA0AE] leading-relaxed mt-1.5">{description}</p>
      
      <button onClick={onCTA} className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-[6px] transition-colors">
        {ctaText}
      </button>
    </div>
  );
};

// --- 3. TRENDING BANNER ---
export const TrendingBanner: React.FC<{
  title: string;
  tagline: string;
  onExplore?: () => void;
  className?: string;
}> = ({ title, tagline, onExplore, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-gradient-to-r from-purple-900 to-indigo-950 select-none text-white flex items-center justify-between ${className}`}>
      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-1">
          <Flame className="w-4 h-4 text-amber-400 fill-current" />
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">CHART TOPPERS</span>
        </div>
        <h3 className="text-base font-black leading-tight uppercase tracking-tight mt-1 truncate">{title}</h3>
        <p className="text-[11px] text-white/70 truncate mt-0.5">{tagline}</p>
      </div>
      <button onClick={onExplore} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full shrink-0">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// --- 4. RECOMMENDATION CARD ---
export const RecommendationCard: React.FC<{
  title: string;
  artist: string;
  coverUrl: string;
  reason?: string;
  onPlay?: () => void;
  className?: string;
}> = ({ title, artist, coverUrl, reason = 'Based on your listen history', onPlay, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`p-3 bg-[#0A113A] rounded-[10px] select-none text-white w-full max-w-[280px] flex flex-col justify-between h-40 ${className}`}>
      <div>
        <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block truncate w-full">
          💡 {reason}
        </span>
        <div className="flex items-center gap-3 mt-3 min-w-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-950">
            {imgFailed ? <TrackPlaceholder size={20} /> : <img src={coverUrl} alt={title} onError={() => setImgFailed(true)} className="w-full h-full object-cover" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-[13px] font-bold text-white truncate">{title}</h4>
            <p className="text-[11px] text-[#9AA0AE] truncate mt-0.5">{artist}</p>
          </div>
        </div>
      </div>
      <button onClick={onPlay} className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-[6px] transition-all flex items-center justify-center gap-1">
        <Play className="w-3 h-3 fill-current ml-0.5" /> Listen Now
      </button>
    </div>
  );
};

// --- 5. DISCOVER CATEGORY CARD ---
export const DiscoverCard: React.FC<{
  title: string;
  iconType: 'radio' | 'nft' | 'playlists' | 'stars';
  onExplore?: () => void;
  className?: string;
}> = ({ title, iconType, onExplore, className = '' }) => {
  const icons = {
    radio: <Radio className="w-6 h-6 text-emerald-400" />,
    nft: <Sparkles className="w-6 h-6 text-purple-400" />,
    playlists: <ListMusic className="w-6 h-6 text-blue-400" />,
    stars: <Award className="w-6 h-6 text-amber-400" />,
  };

  const bgGradients = {
    radio: 'from-emerald-950 to-[#0A113A]',
    nft: 'from-purple-950 to-[#0A113A]',
    playlists: 'from-blue-950 to-[#0A113A]',
    stars: 'from-amber-950 to-[#0A113A]',
  };

  return (
    <div
      onClick={onExplore}
      className={`p-4 rounded-[10px] bg-gradient-to-tr ${bgGradients[iconType]} hover:scale-102 cursor-pointer select-none text-white w-[130px] h-[130px] shrink-0 snap-start flex flex-col justify-between transition-transform ${className}`}
    >
      <div className="p-2 rounded-lg bg-white/5 w-max">
        {icons[iconType]}
      </div>
      <h4 className="text-[13px] font-black uppercase tracking-tight leading-snug">{title}</h4>
    </div>
  );
};

// --- 6. QUICK ACTION WIDGET CARD ---
export const QuickActionCard: React.FC<{
  title: string;
  description: string;
  actionText: string;
  onAction?: () => void;
  className?: string;
}> = ({ title, description, actionText, onAction, className = '' }) => {
  return (
    <div className={`p-4 rounded-[10px] bg-[#0A113A] select-none text-white w-full max-w-[280px] flex flex-col justify-between h-36 ${className}`}>
      <div>
        <h4 className="text-[13px] font-black uppercase tracking-tight leading-none">{title}</h4>
        <p className="text-[11px] text-[#9AA0AE] leading-snug mt-1.5">{description}</p>
      </div>
      <button onClick={onAction} className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-[6px] transition-colors">
        {actionText}
      </button>
    </div>
  );
};

// --- 7. CONTINUE LISTENING CARD (Home overlay bar) ---
export const ContinueListeningCard: React.FC<{
  track?: ContinueTrackData;
  isLoading?: boolean;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  className?: string;
}> = ({ track, isLoading, isPlaying = false, onTogglePlay, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (isLoading || !track) {
    return (
      <div className={`p-2.5 rounded-[10px] bg-[#0A113A]/60 animate-pulse flex items-center justify-between w-full max-w-[480px] ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg" />
          <div className="space-y-1.5">
            <div className="h-4 bg-white/10 rounded w-24" />
            <div className="h-3 bg-white/10 rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-2.5 rounded-[10px] bg-[#0A113A] select-none text-white flex items-center justify-between w-full max-w-[480px] ${className}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-slate-950">
          {imgFailed ? <TrackPlaceholder size={16} /> : <img src={track.coverUrl} alt={track.title} onError={() => setImgFailed(true)} className="w-full h-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[8px] font-black uppercase text-blue-400 block mb-0.5">Resume listening</span>
          <h4 className="text-[13px] font-bold text-white truncate leading-none">{track.title}</h4>
          <p className="text-[11px] text-[#9AA0AE] truncate mt-0.5 leading-none">{track.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-3.5">
        <div className="text-right font-mono text-[9px] text-[#9AA0AE]">
          <span>{track.progressPercent}% done</span>
          <div className="h-1 w-14 bg-white/10 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-blue-500" style={{ width: `${track.progressPercent}%` }} />
          </div>
        </div>
        <button onClick={onTogglePlay} className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg active:scale-95 shrink-0">
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>
      </div>
    </div>
  );
};
