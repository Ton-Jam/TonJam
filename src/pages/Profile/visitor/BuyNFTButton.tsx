import React, { useState } from 'react';
import { Gem, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '@/components/layout/ToastProvider';

interface BuyNFTButtonProps {
  nftId: string;
  nftName: string;
  priceTon: number;
  onSuccess?: () => void;
}

export const BuyNFTButton: React.FC<BuyNFTButtonProps> = ({
  nftId,
  nftName,
  priceTon,
  onSuccess
}) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const toast = useToast();

  const handlePurchase = () => {
    setIsPurchasing(true);
    // Simulate Blockchain Minting / Purchase signature
    setTimeout(() => {
      setIsPurchasing(false);
      toast.success(
        'NFT Purchased',
        `Successfully collected "${nftName}" for ${priceTon} TON. Asset added to your wallet.`
      );
      if (onSuccess) onSuccess();
    }, 2000);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handlePurchase}
      disabled={isPurchasing}
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
    >
      {isPurchasing ? (
        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <Gem className="w-4 h-4" />
          <span>Collect for {priceTon} TON</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </>
      )}
    </motion.button>
  );
};

export default BuyNFTButton;
