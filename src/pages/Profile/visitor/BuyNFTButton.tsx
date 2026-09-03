import React, { useState } from 'react';
import { Gem, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '@/components/layout/ToastProvider';
import NFTPurchaseConfirmationDialog from '@/components/NFTPurchaseConfirmationDialog';

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const toast = useToast();

  const handleConfirmPurchase = () => {
    setIsConfirmOpen(false);
    setIsPurchasing(true);
    // Simulate Blockchain Minting / Purchase signature
    setTimeout(() => {
      setIsPurchasing(false);
      toast.success(
        'NFT Purchased',
        `Successfully collected "${nftName}" for ${priceTon} TON. Asset added to your wallet.`
      );
      if (onSuccess) onSuccess();
    }, 1500);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsConfirmOpen(true)}
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

      <NFTPurchaseConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmPurchase}
        nft={{ id: nftId, title: nftName, price: `${priceTon} TON` }}
        isProcessing={isPurchasing}
        title="Confirm NFT Collection"
        description={`Review price breakdown and local currency equivalent for "${nftName}".`}
      />
    </>
  );
};

export default BuyNFTButton;
