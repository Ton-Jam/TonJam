import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { TON_LOGO } from "@/constants";

interface NFTCollectionCardProps {
  id?: string;
  name: string;
  artist: string;
  coverUrl: string;
  floorPrice: string;
  mintedCount: number;
  totalLimit: number;
  onMint?: () => void;
  onClick?: () => void;
}

const NFTCollectionCard: React.FC<NFTCollectionCardProps> = ({
  id = "genesis-pass",
  name,
  artist,
  coverUrl,
  floorPrice,
  mintedCount,
  totalLimit,
  onMint,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/collections/${id}`);
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMint) {
      onMint();
    } else {
      navigate(`/collections/${id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      style={{
        width: 'var(--card-width, 168px)',
        borderRadius: 'var(--card-radius, 12px)',
        padding: 'var(--card-padding, 10px)',
      }}
      className="w-[168px] shrink-0 bg-white/[0.02] hover:bg-white/[0.05] p-[10px] rounded-[12px] cursor-pointer flex flex-col justify-between border-none text-left transition-all select-none"
    >
      <div 
        className="relative w-full aspect-square rounded-[10px] overflow-hidden bg-neutral-900"
        style={{ borderRadius: 'var(--card-image-radius, 10px)' }}
      >
        <img src={coverUrl} alt={name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
        <div className="absolute bottom-1.5 right-1.5">
          <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-black/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-[4px]">
            {mintedCount}/{totalLimit}
          </span>
        </div>
      </div>

      <div 
        className="text-left space-y-0.5 mt-[6px]"
        style={{ marginTop: 'var(--card-content-gap, 6px)' }}
      >
        <h4 
          className="text-[14px] leading-[20px] font-semibold text-white truncate"
          style={{
            fontSize: 'var(--card-title-size, 14px)',
            lineHeight: 'var(--card-title-line-height, 20px)',
          }}
        >
          {name}
        </h4>
        <p 
          className="text-[12px] leading-[17px] font-normal text-slate-400 truncate"
          style={{
            fontSize: 'var(--card-meta-size, 12px)',
            lineHeight: 'var(--card-meta-line-height, 17px)',
          }}
        >
          {artist}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-left">
          <span 
            className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold leading-none"
          >
            Floor
          </span>
          <p className="text-[12px] leading-[17px] font-bold text-cyan-400 font-mono flex items-center gap-1 mt-0.5">
            <img src={TON_LOGO} className="w-3 h-3 object-contain inline" alt="" />
            {floorPrice} TON
          </p>
        </div>
        <button
          type="button"
          onClick={handleAction}
          style={{
            height: 'var(--card-action-height, 34px)',
            borderRadius: 'var(--card-action-radius, 8px)',
          }}
          className="h-[34px] text-xs font-bold uppercase tracking-wider px-3.5 bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white rounded-[8px] cursor-pointer border-none shadow-md shadow-blue-600/20 inline-flex items-center justify-center transition-all select-none"
        >
          View
        </button>
      </div>
    </motion.div>
  );
};

export default NFTCollectionCard;
