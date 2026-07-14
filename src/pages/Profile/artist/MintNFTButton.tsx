import React, { useState } from 'react';
import { Gem } from 'lucide-react';
import { motion } from 'motion/react';
import { MintNFTModal } from '@/components/MintNFTModal';

export const MintNFTButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(true)}
        className="flex-1 bg-[#101A3B] border border-white/5 hover:border-white/10 hover:bg-[#15234f] text-slate-200 hover:text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none h-24"
      >
        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
          <Gem className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">Mint Music NFT</span>
      </motion.button>

      <MintNFTModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default MintNFTButton;
