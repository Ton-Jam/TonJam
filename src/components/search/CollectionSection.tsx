import React from 'react';
import { Layers, Users, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { getPlaceholderImage } from '@/lib/utils';
import { CollectionItem } from './search-types';

interface CollectionSectionProps {
  collections: CollectionItem[];
}

export const CollectionSection: React.FC<CollectionSectionProps> = ({ collections }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Marketplace Classifications</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Popular Collections</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {collections.map((col) => {
          const imageSrc = col.coverUrl || getPlaceholderImage(col.name);

          return (
            <motion.div
              key={`collection-${col.id}`}
              whileHover={{ y: -3 }}
              onClick={() => navigate(`/marketplace`)}
              className="bg-[#090f2d] hover:bg-[#121A3E]/20 rounded-xl border border-white/5 p-4 flex gap-4 cursor-pointer group"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/5">
                <img
                  src={imageSrc}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = getPlaceholderImage(col.name); }}
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#0052FF] transition-colors">
                    {col.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">by {col.creator}</p>
                </div>

                <div className="flex gap-3 text-[9px] font-mono text-slate-500 uppercase font-semibold">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    {col.itemsCount} items
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    {col.ownersCount} owners
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono font-bold border-t border-white/5 pt-1.5 mt-1">
                  <div>
                    <span className="text-[8px] text-slate-500 font-normal">FLOOR</span>
                    <span className="text-white block">{col.floorPrice} TON</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-500 font-normal">VOLUME</span>
                    <span className="text-emerald-400 block">{col.totalVolume} TON</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
