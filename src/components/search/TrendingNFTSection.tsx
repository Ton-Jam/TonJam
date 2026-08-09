import React from 'react';
import { Gem, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { NFTItem } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

interface TrendingNFTSectionProps {
  nfts: NFTItem[];
  title?: string;
}

export const TrendingNFTSection: React.FC<TrendingNFTSectionProps> = ({ nfts, title }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-widest">Web3 Digital Assets</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">{title || "Trending NFTs"}</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {nfts.map((nft) => {
          const imageSrc = nft.imageUrl || nft.coverUrl || getPlaceholderImage(nft.title);

          return (
            <motion.div
              key={`trending-nft-${nft.id}`}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/nft/${nft.id}`)}
              className="bg-[#0c133a] rounded-[12px] p-4 flex flex-col justify-between aspect-[4/5] cursor-pointer group transition-all"
            >
              <div className="relative aspect-square rounded-[8px] overflow-hidden bg-slate-950">
                <img
                  src={imageSrc}
                  alt={nft.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = getPlaceholderImage(nft.title); }}
                />
                <div className="absolute top-2 left-2 bg-[#050A24]/95 text-[7px] font-mono font-bold text-[#00B4D8] px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <Gem className="w-2.5 h-2.5 text-[#00B4D8]" />
                  <span>MINTED</span>
                </div>
              </div>

              <div className="mt-3 space-y-1 truncate">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#00B4D8] transition-colors">
                  {nft.title}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">{nft.artist || nft.creator}</p>
                
                <div className="flex justify-between items-center pt-2 mt-2">
                  <div className="space-y-0.5">
                    <p className="text-[7.5px] font-mono text-slate-500 uppercase tracking-wider">VALUE</p>
                    <p className="text-[10px] font-mono font-extrabold text-white">{nft.price} TON</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[7.5px] font-mono text-slate-500 uppercase tracking-wider">SUPPLY</p>
                    <p className="text-[9px] font-mono font-bold text-slate-300">{nft.edition || '1/1'}</p>
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
