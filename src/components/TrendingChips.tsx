import React from 'react';
import { Flame, TrendingUp, Sparkles, Music, Disc, Radio } from 'lucide-react';
import { motion } from 'motion/react';

interface TrendingChipsProps {
  onSelect: (term: string) => void;
  className?: string;
}

interface ChipItem {
  label: string;
  query: string;
  icon: React.ReactNode;
  bgClass: string;
  textClass: string;
}

const TRENDING_CHIPS: ChipItem[] = [
  { label: 'Cyberpunk Beats', query: 'Cyberpunk Beats', icon: <Flame className="w-3 h-3 text-orange-400" />, bgClass: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20', textClass: 'text-orange-300' },
  { label: 'Phonk Drift', query: 'Phonk', icon: <TrendingUp className="w-3 h-3 text-emerald-400" />, bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20', textClass: 'text-emerald-300' },
  { label: 'Lo-Fi Chill', query: 'Lo-fi hip hop', icon: <Sparkles className="w-3 h-3 text-purple-400" />, bgClass: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20', textClass: 'text-purple-300' },
  { label: 'Genesis NFT', query: 'Genesis NFT', icon: <Disc className="w-3 h-3 text-blue-400" />, bgClass: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20', textClass: 'text-blue-300' },
  { label: 'Synthwave', query: 'Synthwave', icon: <Radio className="w-3 h-3 text-pink-400" />, bgClass: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20', textClass: 'text-pink-300' },
  { label: 'Ambient Vibes', query: 'Ambient', icon: <Music className="w-3 h-3 text-cyan-400" />, bgClass: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20', textClass: 'text-cyan-300' },
];

export const TrendingChips: React.FC<TrendingChipsProps> = ({
  onSelect,
  className = "",
}) => {
  return (
    <div className={`w-full flex items-center gap-2.5 select-none py-1.5 overflow-x-auto no-scrollbar ${className}`}>
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/20 rounded-lg shrink-0 mr-1">
        <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Trending</span>
      </div>

      {TRENDING_CHIPS.map((chip, idx) => (
        <motion.button
          key={`${chip.query}-${idx}`}
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(chip.query)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border cursor-pointer transition-all shrink-0 group shadow-sm ${chip.bgClass}`}
        >
          {chip.icon}
          <span className={`text-xs font-bold tracking-wide group-hover:text-white transition-colors ${chip.textClass}`}>
            {chip.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default TrendingChips;
